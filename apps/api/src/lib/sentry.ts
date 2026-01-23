/**
 * Sentry Error Tracking
 * 
 * Provides error tracking and performance monitoring.
 * Gracefully degrades if SENTRY_DSN is not configured.
 */

import * as Sentry from "@sentry/node";

const isConfigured = !!process.env.SENTRY_DSN;

if (!isConfigured) {
  console.warn("SENTRY_DSN not set - Error tracking disabled");
}

/**
 * Initialize Sentry
 * Call this early in your application startup
 */
export function initSentry() {
  if (!isConfigured) return;

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    integrations: [
      Sentry.httpIntegration(),
      Sentry.nativeNodeFetchIntegration(),
    ],
    beforeSend(event) {
      // Don't send events in development unless explicitly enabled
      if (process.env.NODE_ENV === "development" && !process.env.SENTRY_DEBUG) {
        console.log("[Sentry] Would send event:", event.message || event.exception);
        return null;
      }
      return event;
    },
  });
}

/**
 * Capture exception
 */
export function captureException(
  error: Error | unknown,
  context?: {
    user?: { id: string; email?: string };
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  },
) {
  if (!isConfigured) {
    console.error("[Error]", error);
    return;
  }

  Sentry.withScope((scope) => {
    if (context?.user) {
      scope.setUser(context.user);
    }
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

/**
 * Capture message
 */
export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: {
    user?: { id: string; email?: string };
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  },
) {
  if (!isConfigured) {
    console.log(`[${level.toUpperCase()}]`, message);
    return;
  }

  Sentry.withScope((scope) => {
    scope.setLevel(level);
    if (context?.user) {
      scope.setUser(context.user);
    }
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureMessage(message);
  });
}

/**
 * Set user context
 */
export function setUser(user: { id: string; email?: string; name?: string } | null) {
  if (!isConfigured) return;
  Sentry.setUser(user);
}

/**
 * Add breadcrumb
 */
export function addBreadcrumb(breadcrumb: {
  category?: string;
  message: string;
  level?: "debug" | "info" | "warning" | "error";
  data?: Record<string, unknown>;
}) {
  if (!isConfigured) return;
  Sentry.addBreadcrumb({
    category: breadcrumb.category || "app",
    message: breadcrumb.message,
    level: breadcrumb.level || "info",
    data: breadcrumb.data,
  });
}

/**
 * Start a transaction/span for performance monitoring
 */
export function startSpan<T>(
  name: string,
  operation: string,
  callback: () => T | Promise<T>,
): T | Promise<T> {
  if (!isConfigured) {
    return callback();
  }

  return Sentry.startSpan(
    {
      name,
      op: operation,
    },
    callback,
  );
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: { name?: string; tags?: Record<string, string> },
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      captureException(error, {
        tags: { function: context?.name || fn.name, ...context?.tags },
        extra: { args },
      });
      throw error;
    }
  }) as T;
}

/**
 * Flush pending events (useful before serverless function ends)
 */
export async function flush(timeout = 2000) {
  if (!isConfigured) return;
  await Sentry.flush(timeout);
}

// Export Sentry for advanced usage
export { Sentry };
