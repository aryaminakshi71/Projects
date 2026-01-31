/**
 * API Application
 *
 * Hono app with oRPC integration for Cloudflare Workers.
 */

import { createDb } from "@projects/storage";
import { OpenAPIGenerator } from "@orpc/openapi";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import type { AppEnv, InitialContext } from "./context";
import { createAuthFromEnv } from "./lib/create-auth-from-env";
import { loggerMiddleware } from "./middleware/logger";
import { initSentry } from "./lib/sentry";
import { initDatadog } from "./lib/datadog";
import { rateLimitRedis } from "./middleware/rate-limit-redis";
import { appRouter } from "./routers";

/**
 * Create Hono app with all routes
 */
export function createApp() {
  const app = new Hono<{ Bindings: AppEnv }>();

  // Initialize monitoring
  initSentry();
  initDatadog();

  // Global middleware
  app.use("*", cors({ origin: (origin: string | null) => origin, credentials: true }));
  app.use("*", requestId());
  app.use("*", loggerMiddleware);

  // Rate limiting middleware
  app.use("/api/*", rateLimitRedis({ limiterType: "api" }));
  app.use("/api/auth/*", rateLimitRedis({ limiterType: "auth" }));

  // Health check (non-RPC)
  app.get("/api/health", (c: any) => {
    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  });

  // Direct R2 upload route
  app.post("/api/assets/upload", async (c: any) => {
    // Basic auth check (can be improved by using middleware)
    const authHeader = c.req.header("Authorization");
    if (!authHeader && (c.env.NODE_ENV === "production")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.parseBody();
    const file = body.file as File;

    if (!file) {
      return c.json({ error: "No file uploaded" }, 400);
    }

    const key = `${crypto.randomUUID()}-${file.name}`;

    if (c.env.BUCKET) {
      await c.env.BUCKET.put(key, await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type },
      });

      // In a real app, you'd have a custom domain for R2
      // For demo, we'll return a path that our worker can serve or a public R2 URL
      const url = `${c.env.VITE_PUBLIC_SITE_URL}/api/assets/raw/${key}`;
      return c.json({ url, key });
    }

    // Fallback for local dev without R2
    return c.json({
      url: `https://picsum.photos/seed/${Math.random().toString(36).substring(7)}/1200/800`,
      key: "mock-key",
      message: "R2 Bucket not found, using mock URL"
    });
  });

  // Serve raw assets from R2
  app.get("/api/assets/raw/:key", async (c: any) => {
    const key = c.req.param("key");
    if (c.env.BUCKET) {
      const object = await c.env.BUCKET.get(key);
      if (!object) return c.notFound();

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);

      return new Response(object.body, { headers });
    }
    return c.notFound();
  });

  // Better Auth handler (includes Stripe webhook at /api/auth/stripe/webhook)
  app.on(["GET", "POST"], "/api/auth/*", async (c: any) => {
    // Fallback to process.env when running without Cloudflare Workers
    // c.env may be undefined when not running on Cloudflare (SKIP_CLOUDFLARE=true)
    const envBindings = c.env || {};
    const connectionString =
      envBindings.DATABASE?.connectionString || process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        "DATABASE connection string not found in environment bindings or process.env.DATABASE_URL",
      );
    }

    const db = createDb({ connectionString });

    // Create minimal env object with defaults for missing bindings
    const minimalEnv = {
      DATABASE_URL: connectionString,
      NODE_ENV: envBindings.NODE_ENV || process.env.NODE_ENV || "development",
      VITE_PUBLIC_SITE_URL:
        envBindings.VITE_PUBLIC_SITE_URL ||
        process.env.VITE_PUBLIC_SITE_URL ||
        "http://localhost:5173",
      BETTER_AUTH_SECRET:
        envBindings.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET,
      CACHE: envBindings.CACHE,
      BUCKET: envBindings.BUCKET,
      ASSETS: envBindings.ASSETS,
      IMAGES: envBindings.IMAGES,
      AI: envBindings.AI,
      GOOGLE_CLIENT_ID: envBindings.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: envBindings.GOOGLE_CLIENT_SECRET,
      GITHUB_CLIENT_ID: envBindings.GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET: envBindings.GITHUB_CLIENT_SECRET,
      STRIPE_SECRET_KEY: envBindings.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: envBindings.STRIPE_WEBHOOK_SECRET,
    };

    const auth = createAuthFromEnv(db, minimalEnv as any);
    return auth.handler(c.req.raw);
  });

  // oRPC handler
  const rpcHandler = new RPCHandler(appRouter, {
    interceptors: [
      onError((error: unknown) => {
        console.error("[RPC Error]", error);
      }),
    ],
  });

  app.use("/api/rpc/*", async (c: any, next: any) => {
    const initialContext: InitialContext = {
      env: c.env,
      headers: c.req.raw.headers,
      requestId: c.get("requestId") || crypto.randomUUID(),
      logger: c.get("logger"),
    };

    const { matched, response } = await rpcHandler.handle(c.req.raw, {
      prefix: "/api/rpc",
      context: initialContext,
    });

    if (matched && response) {
      return c.newResponse(response.body, response);
    }

    await next();
  });

  // OpenAPI spec
  app.get("/api/openapi.json", async (c: any) => {
    const generator = new OpenAPIGenerator({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    });

    const spec = await generator.generate(appRouter, {
      info: {
        title: "Projects API",
        version: "1.0.0",
        description: "Project management platform",
      },
      servers: [{ url: c.env.VITE_PUBLIC_SITE_URL, description: "Current" }],
      security: [{ bearerAuth: [] }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
          },
        },
      },
    });

    return c.json(spec);
  });

  return app;
}

// Default app instance
export const api = createApp();
