/**
 * API Context Types
 *
 * Defines the context types for oRPC procedures.
 * Uses inferred types from Better Auth to avoid drift.
 *
 * IMPORTANT: Database is NOT in context to avoid type inference bloat.
 * Use `getDb(context)` from `./lib/db` in procedures instead.
 * See: https://orpc.dev/docs/advanced/exceeds-the-maximum-length-problem
 */

import type { Auth } from "@projects/auth";
import type { Logger } from "@projects/logger";

/**
 * Cloudflare Worker environment bindings
 */
export interface ImagesBinding {
  info(stream: ReadableStream): Promise<{
    width: number;
    height: number;
    format: string;
  }>;
  input(stream: ReadableStream): ImageTransform;
}

export interface ImageTransform {
  transform(options: {
    width?: number;
    height?: number;
    fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
    rotate?: 0 | 90 | 180 | 270;
    blur?: number;
    trim?: { top?: number; right?: number; bottom?: number; left?: number };
  }): ImageTransform;
  output(options: {
    format: "image/webp" | "image/avif" | "image/jpeg" | "image/png";
    quality?: number;
  }): Promise<{ response: () => Response; image: () => ReadableStream }>;
}

export interface AIBinding {
  run<T = unknown>(
    model: string,
    inputs: Record<string, unknown>
  ): Promise<T>;
}

export interface AppEnv {
  DATABASE: { connectionString: string };
  CACHE: KVNamespace;
  BUCKET: R2Bucket;
  ASSETS?: Fetcher;
  IMAGES?: ImagesBinding;
  AI?: AIBinding;
  BETTER_AUTH_SECRET: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  VITE_PUBLIC_SITE_URL: string;
  NODE_ENV: string;
}

/**
 * Initial context provided at request start
 */
export interface InitialContext {
  env: AppEnv;
  headers: Headers;
  requestId: string;
  logger: Logger;
}

/**
 * Context after auth middleware
 *
 * Note: Database is accessed via `getDb(context)` not from context directly.
 * This avoids type inference bloat that causes TS7056 errors.
 *
 * User and session types are inferred from Better Auth to avoid type drift.
 */
export interface AuthContext extends InitialContext {
  auth: Auth;
  /** User from Better Auth session - inferred type */
  user: Auth["$Infer"]["Session"]["user"];
  /** Session from Better Auth - inferred type */
  session: Auth["$Infer"]["Session"]["session"];
  /** Present when authenticated via API key instead of session */
  apiKeyId?: string;
  /** API key permissions (format: "resource:action") */
  permissions?: string[];
}

/**
 * Context after organization middleware
 * Organization and member data are prefetched in a single query.
 */
export interface OrgContext extends AuthContext {
  organization: {
    id: string;
    name: string;
    slug: string;
    plan: string;
  };
  member: {
    id: string;
    role: "owner" | "admin" | "member";
  };
}

/**
 * Full context with all dependencies
 */
export type FullContext = OrgContext;
