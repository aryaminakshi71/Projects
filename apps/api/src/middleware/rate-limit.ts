/**
 * Rate Limiting Middleware
 */

import type { Context, Next } from "hono";
import type { Logger } from "@projects/logger";
import { RateLimitError } from "../lib/errors";

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (c: Context) => string;
}

const defaultOptions: RateLimitOptions = {
  windowMs: 60 * 1000,
  maxRequests: 100,
  keyGenerator: (c) => {
    const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    const userId = c.get("user")?.id;
    return userId ? `user:${userId}` : `ip:${ip}`;
  },
};

export function rateLimit(options: Partial<RateLimitOptions> = {}) {
  const opts = { ...defaultOptions, ...options };
  
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetAt < now) {
        rateLimitStore.delete(key);
      }
    }
  }, opts.windowMs);

  return async (c: Context, next: Next) => {
    const key = opts.keyGenerator!(c);
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record || record.resetAt < now) {
      rateLimitStore.set(key, {
        count: 1,
        resetAt: now + opts.windowMs,
      });
      await next();
      return;
    }

    if (record.count >= opts.maxRequests) {
      const logger = c.get("logger") as Logger | undefined;
      logger?.warn({ key, count: record.count }, "rate-limit-exceeded");

      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      throw new RateLimitError(
        `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        retryAfter
      );
    }

    record.count++;
    await next();
  };
}
