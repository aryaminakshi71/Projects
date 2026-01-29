import handler from "@tanstack/react-start/server-entry";
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
    try {
      console.log("[server.ts] Handling request:", request.url);

      // Type assertion needed because module augmentation isn't fully applied
      // until vite dev/build generates the complete route tree
      return await handler.fetch(request, {
        context: {
          cloudflare: { env, ctx },
        },
        // Pass the request context to the server functions
      } as Parameters<typeof handler.fetch>[1]);
    } catch (error) {
      console.error("[server.ts] Error handling request:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
