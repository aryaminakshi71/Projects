/**
 * Server environment variables
 *
 * Includes all environment variables (client + server-only).
 * Never exposed to browser - import from "@projects/env/server" explicitly.
 */

import { z } from "zod";
import { clientSchema } from "./client";

const serverSchema = clientSchema.extend({
  // ============================================================================
  // OPERATIONAL CONFIG
  // ============================================================================

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // ============================================================================
  // AUTH (Better Auth)
  // ============================================================================

  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),

  // OAuth Providers
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // ============================================================================
  // REDIS (Upstash)
  // Uses REST API naming convention expected by @upstash/redis fromEnv()
  // ============================================================================

  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // ============================================================================
  // STRIPE BILLING
  // ============================================================================

  STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),

  // ============================================================================
  // MONITORING (Sentry)
  // ============================================================================

  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),
  SENTRY_DEBUG: z.string().optional(),

  // ============================================================================
  // APM (Datadog)
  // ============================================================================

  DATADOG_API_KEY: z.string().optional(),
  DATADOG_SERVICE_NAME: z.string().optional(),
  DATADOG_ENV: z.string().optional(),
  DATADOG_VERSION: z.string().optional(),

  // ============================================================================
  // LOG AGGREGATION
  // ============================================================================

  LOG_AGGREGATION_ENDPOINT: z.string().url().optional(),
  LOG_AGGREGATION_API_KEY: z.string().optional(),
  LOG_AGGREGATION_SERVICE: z.enum(["datadog", "logtail", "cloudwatch", "custom"]).optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;

// Get environment data based on current runtime
const getEnvData = () => {
  const globalObj = globalThis as any;

  // 1. Check for Cloudflare runtime first (safest check)
  // In Cloudflare Workers, 'process' is often polyfilled or missing.
  // However, the 'cloudflare:workers' env is the definitive source.
  // Try to catch the import in a way that doesn't break Node builds.

  // 2. Try process.env (Node/Bun/Vite)
  if (typeof process !== "undefined" && process.env) {
    return process.env;
  }

  // 3. Try globalThis.process.env
  if (globalObj.process?.env) {
    return globalObj.process.env;
  }

  // 4. Default to empty if nothing found
  return {};
};

/**
 * Validated server environment variables
 */
export const env: ServerEnv = serverSchema.parse(getEnvData());
