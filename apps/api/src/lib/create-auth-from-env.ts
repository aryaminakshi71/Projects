/**
 * Shared Auth Configuration
 *
 * Creates a Better Auth instance from environment bindings.
 * Used by both the Hono app and oRPC procedures to avoid duplication.
 */

import { createAuth } from "@projects/auth";
import type { Database } from "@projects/storage";
import type { AppEnv } from "../context";

export function createAuthFromEnv(db: Database, env: AppEnv) {
  return createAuth({
    db,
    kv: env.CACHE,
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.VITE_PUBLIC_SITE_URL,
    oauth: {
      google: env.GOOGLE_CLIENT_ID
        ? { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET! }
        : undefined,
      github: env.GITHUB_CLIENT_ID
        ? { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET! }
        : undefined,
    },
    stripe: env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET
      ? { secretKey: env.STRIPE_SECRET_KEY, webhookSecret: env.STRIPE_WEBHOOK_SECRET }
      : undefined,
  });
}
