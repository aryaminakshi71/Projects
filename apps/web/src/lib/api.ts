/**
 * API Client
 *
 * oRPC client for type-safe API calls.
 */

import { createORPCClient } from "@orpc/client";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { AppRouter } from "@projects/api/router";

const baseURL = import.meta.env.VITE_PUBLIC_SITE_URL || "http://localhost:3001";

// @ts-expect-error - oRPC type system has limitations with nested router structures
// The runtime behavior is correct, but TypeScript can't infer the nested client type
export const apiClient = createORPCClient<AppRouter>({
  baseURL,
  prefix: "/api/rpc",
  headers: () => {
    const headers: Record<string, string> = {};
    
    // Add demo mode header
    const isDemo = typeof window !== "undefined" && localStorage.getItem("demo_mode") === "true";
    headers["x-demo-mode"] = isDemo ? "true" : "false";

    return headers;
  },
});

// @ts-expect-error - Same type limitation as above
export const api = createTanstackQueryUtils(apiClient);
