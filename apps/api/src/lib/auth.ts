/**
 * Better Auth setup for Projects app
 * 
 * NOTE: This file is kept for backward compatibility with middleware/orpc.ts
 * New code should use createAuthFromEnv from ./create-auth-from-env.ts
 */

import { createDb } from "@projects/storage";
import { createAuthFromEnv } from "./create-auth-from-env";

// Create a default auth instance for middleware
// This is only used in legacy middleware, not in the main app
let _auth: ReturnType<typeof createAuthFromEnv> | null = null;

export function getAuth() {
  if (!_auth) {
    // Create a minimal db instance for auth
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL not found");
    }
    const db = createDb({ connectionString });
    const minimalEnv = {
      DATABASE: { connectionString },
      CACHE: {} as KVNamespace,
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "",
      VITE_PUBLIC_SITE_URL: process.env.VITE_PUBLIC_SITE_URL || "http://localhost:5173",
    } as any;
    _auth = createAuthFromEnv(db, minimalEnv);
  }
  return _auth;
}

export const auth = getAuth();
