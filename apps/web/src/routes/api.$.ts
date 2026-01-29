import { api } from "@projects/api";
import { createFileRoute } from "@tanstack/react-router";
import type { CloudflareRequestContext } from "../server";

// Default environment for local development when Cloudflare bindings aren't available
function getDefaultEnv(): CloudflareRequestContext["cloudflare"]["env"] {
  return {
    DATABASE: { connectionString: process.env.DATABASE_URL || "" },
    NODE_ENV: process.env.NODE_ENV || "development",
    VITE_PUBLIC_SITE_URL: process.env.VITE_PUBLIC_SITE_URL || "http://localhost:3001",
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "",
    CACHE: undefined as any,
    BUCKET: undefined as any,
    ASSETS: undefined as any,
    IMAGES: undefined as any,
    AI: undefined as any,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  };
}

// Generic handler for all HTTP methods
async function handleApiRequest(ctx: { context: unknown; request: Request }): Promise<Response> {
  const context = ctx.context as unknown as CloudflareRequestContext;
  const cloudflare = context.cloudflare as CloudflareRequestContext["cloudflare"] | undefined;
  const env = cloudflare?.env || getDefaultEnv();
  const executionCtx = cloudflare?.ctx;

  // Clone the request to avoid issues with body consumption
  const request = new Request(ctx.request.url, {
    method: ctx.request.method,
    headers: ctx.request.headers,
    body: ctx.request.body ? await ctx.request.clone().blob() : undefined,
    cache: ctx.request.cache,
    credentials: ctx.request.credentials,
    integrity: ctx.request.integrity,
    keepalive: ctx.request.keepalive,
    mode: ctx.request.mode,
    redirect: ctx.request.redirect,
    referrer: ctx.request.referrer,
    referrerPolicy: ctx.request.referrerPolicy,
  });

  try {
    return await api.fetch(request, env, executionCtx);
  } catch (error) {
    console.error("[API Route] Error handling request:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error", message: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      HEAD: handleApiRequest,
      GET: handleApiRequest,
      POST: handleApiRequest,
      PUT: handleApiRequest,
      PATCH: handleApiRequest,
      DELETE: handleApiRequest,
      OPTIONS: handleApiRequest,
    },
  },
});
