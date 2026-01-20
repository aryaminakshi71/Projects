/**
 * Logger Middleware
 *
 * Creates a request-scoped logger and attaches it to Hono context.
 */

import type { Context, Next } from "hono";
import { createRequestLoggerFromRequest, type Logger } from "@projects/logger";

export async function loggerMiddleware(c: Context, next: Next) {
  const logger = createRequestLoggerFromRequest(c.req.raw, {
    requestId: c.get("requestId") || crypto.randomUUID(),
  });
  c.set("logger", logger);
  await next();
}

export type { Logger };
