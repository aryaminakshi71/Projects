/**
 * Redis-based Rate Limiting Middleware
 * 
 * Uses Upstash Redis for distributed rate limiting.
 * Falls back to in-memory if Redis not configured.
 */

import type { Context, Next } from "hono";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@projects/storage/redis";
import { RateLimitError } from "../lib/errors";

interface RateLimitOptions {
  windowSeconds: number;
  maxRequests: number;
  keyGenerator?: (c: Context) => string;
  limiterType?: "api" | "auth" | "strict";
}

const defaultLimiters = {
  api: { windowSeconds: 60, maxRequests: 100 },
  auth: { windowSeconds: 60, maxRequests: 10 },
  strict: { windowSeconds: 60, maxRequests: 5 },
};

const createRateLimiter = (type: "api" | "auth" | "strict") => {
  const redisClient = redis.client;
  // Check if Redis client is a no-op client (not configured)
  // No-op clients return null or have a specific property
  if (!redisClient || (redisClient as any).__noop) return null;
  
  // Additional check: if Redis URL is empty or invalid, don't create limiter
  const url = process.env.UPSTASH_REDIS_REST_URL || "";
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || "";
  if (!url || !token || url.trim() === "" || token.trim() === "") {
    return null;
  }
  
  const config = defaultLimiters[type];
  return new Ratelimit({
    redis: redisClient as any,
    limiter: Ratelimit.slidingWindow(config.maxRequests, `${config.windowSeconds} s`),
    analytics: true,
    prefix: `ratelimit:${type}`,
  });
};

const rateLimiters = {
  api: createRateLimiter("api"),
  auth: createRateLimiter("auth"),
  strict: createRateLimiter("strict"),
};

const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

export function rateLimitRedis(options: Partial<RateLimitOptions> = {}) {
  const opts: RateLimitOptions = {
    windowSeconds: 60,
    maxRequests: 100,
    keyGenerator: (c) => {
      const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
      const userId = c.get("user")?.id;
      return userId ? `user:${userId}` : `ip:${ip}`;
    },
    limiterType: "api",
    ...options,
  };

  return async (c: Context, next: Next) => {
    const key = opts.keyGenerator!(c);
    
    if (opts.limiterType && rateLimiters[opts.limiterType]) {
      const limiter = rateLimiters[opts.limiterType]!;
      try {
        // Add explicit timeout wrapper to prevent 4.3s delay
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Rate limit check timeout")), 500)
        );
        
        const result = await Promise.race([
          limiter.limit(key),
          timeoutPromise
        ]) as Awaited<ReturnType<typeof limiter.limit>>;
        
        if (!result.success) {
          const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
          throw new RateLimitError(
            `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
            retryAfter,
          );
        }
        
        c.header("X-RateLimit-Limit", result.limit.toString());
        c.header("X-RateLimit-Remaining", result.remaining.toString());
        c.header("X-RateLimit-Reset", result.reset.toString());
      } catch (err) {
        // Check if it's a RateLimitError - use duck typing for Workers compatibility
        if (err && typeof err === 'object' && ('name' in err && err.name === 'RateLimitError' || 'code' in err && (err as any).code === 'RATE_LIMITED')) {
          throw err;
        }
        // Fail open if Redis fails or times out (matching CRM pattern)
        console.error("Rate limit error (fail open):", err);
      }
      
      await next();
      return;
    }
    
    // Fallback to in-memory
    const now = Date.now();
    const windowMs = opts.windowSeconds * 1000;
    const record = inMemoryStore.get(key);
    
    if (!record || record.resetAt < now) {
      inMemoryStore.set(key, { count: 1, resetAt: now + windowMs });
      await next();
      return;
    }
    
    if (record.count >= opts.maxRequests) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      throw new RateLimitError(
        `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      );
    }
    
    record.count++;
    await next();
  };
}
