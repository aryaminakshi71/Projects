import handler from "@tanstack/react-start/server-entry";
import { api } from "@projects/api/app";
import type { getRouter } from "./router";
import type { startInstance } from "./start";
import type { Env } from "@projects/env/cloudflare";

/**
 * Cloudflare context passed through TanStack Start's request context
 */
export interface CloudflareRequestContext {
  cloudflare: {
    env: Env;
    ctx: ExecutionContext;
  };
}

// Augment TanStack Start's Register interface for type safety
declare module "@tanstack/react-start" {
  interface Register {
    ssr: true;
    router: ReturnType<typeof getRouter>;
    config: Awaited<ReturnType<typeof startInstance.getOptions>>;
    server: {
      requestContext: CloudflareRequestContext;
    };
  }
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    // Handle API routes - integrated API
    if (url.pathname.startsWith("/api")) {
      return api.fetch(request, env as any, ctx);
    }

    return handler.fetch(request, {
      context: {
        cloudflare: { env, ctx },
      },
    } as Parameters<typeof handler.fetch>[1]);
  },
};
