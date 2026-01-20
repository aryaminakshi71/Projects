/**
 * Create oRPC context from Hono context
 */

import type { Context } from "hono";
import type { Logger } from "@projects/logger";
import { getDb } from "../lib/db";
import { auth } from "../lib/auth";

export async function createOrpcContext(c: Context) {
  const logger = c.get("logger") as Logger;

  // Resolve auth context
  let session = null;
  let user = null;

  try {
    const authResult = await auth.api.getSession({
      headers: c.req.raw.headers,
    });
    if (authResult) {
      session = authResult.session;
      user = authResult.user;
    }
  } catch (error) {
    logger?.error(
      { error, path: c.req.path },
      "orpc:auth-resolution-failed",
    );
  }

  // Note: db is not included in context to avoid type inference bloat
  // Use getDb(context) in procedures instead
  return {
    headers: c.req.raw.headers,
    logger,
    session,
    user,
  };
}
