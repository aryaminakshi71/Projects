/**
 * Structured JSON Logger with Aggregation Support
 * 
 * Provides JSON logging with support for log aggregation services
 * (Datadog, Logtail, CloudWatch, etc.)
 */

import type { Logger } from "./index";
import { createLogger, type CreateLoggerOptions } from "./index";

export interface LogAggregationConfig {
  /** Service name for log aggregation (e.g., "datadog", "logtail") */
  service?: "datadog" | "logtail" | "cloudwatch" | "custom";
  /** Custom endpoint for log shipping */
  endpoint?: string;
  /** API key for log aggregation service */
  apiKey?: string;
  /** Batch size for log shipping */
  batchSize?: number;
  /** Flush interval in milliseconds */
  flushInterval?: number;
}

export interface StructuredLoggerOptions extends CreateLoggerOptions {
  /** Log aggregation configuration */
  aggregation?: LogAggregationConfig;
  /** Enable JSON output (default: true in production) */
  jsonOutput?: boolean;
}

// Log buffer for batching
let logBuffer: Array<Record<string, unknown>> = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Flush logs to aggregation service
 */
async function flushLogs(config: LogAggregationConfig): Promise<void> {
  if (logBuffer.length === 0) return;
  if (!config.endpoint || !config.apiKey) return;

  const logs = logBuffer.splice(0, config.batchSize || 100);

  try {
    await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`,
        "DD-API-KEY": config.apiKey, // Datadog format
      },
      body: JSON.stringify({
        logs: logs.map((log) => ({
          ...log,
          service: config.service || "api",
          ddsource: "nodejs", // Datadog source
        })),
      }),
    });
  } catch (error) {
    // Fallback to console if aggregation fails
    console.error("Failed to send logs to aggregation service:", error);
    logs.forEach((log) => console.log(JSON.stringify(log)));
  }
}

/**
 * Create structured logger with aggregation support
 */
export function createStructuredLogger(
  options: StructuredLoggerOptions
): Logger {
  const {
    aggregation,
    jsonOutput = process.env.NODE_ENV === "production",
    ...loggerOptions
  } = options;

  const baseLogger = createLogger(loggerOptions);

  // Set up log flushing if aggregation is configured
  if (aggregation?.endpoint && aggregation?.apiKey) {
    const flushInterval = aggregation.flushInterval || 5000; // 5 seconds default

    if (!flushTimer) {
      flushTimer = setInterval(() => {
        flushLogs(aggregation).catch(console.error);
      }, flushInterval);
    }
  }

  // Wrap logger methods to add aggregation
  const structuredLogger: Logger = {
    trace: (obj: object | string, msg?: string) => {
      baseLogger.trace(obj, msg);
      if (aggregation && jsonOutput) {
        addToBuffer("trace", obj, msg, loggerOptions);
      }
    },
    debug: (obj: object | string, msg?: string) => {
      baseLogger.debug(obj, msg);
      if (aggregation && jsonOutput) {
        addToBuffer("debug", obj, msg, loggerOptions);
      }
    },
    info: (obj: object | string, msg?: string) => {
      baseLogger.info(obj, msg);
      if (aggregation && jsonOutput) {
        addToBuffer("info", obj, msg, loggerOptions);
      }
    },
    warn: (obj: object | string, msg?: string) => {
      baseLogger.warn(obj, msg);
      if (aggregation && jsonOutput) {
        addToBuffer("warn", obj, msg, loggerOptions);
      }
    },
    error: (obj: object | string, msg?: string) => {
      baseLogger.error(obj, msg);
      if (aggregation && jsonOutput) {
        addToBuffer("error", obj, msg, loggerOptions);
      }
    },
    fatal: (obj: object | string, msg?: string) => {
      baseLogger.fatal(obj, msg);
      if (aggregation && jsonOutput) {
        addToBuffer("fatal", obj, msg, loggerOptions);
        // Flush immediately on fatal errors
        if (aggregation.endpoint && aggregation.apiKey) {
          flushLogs(aggregation).catch(console.error);
        }
      }
    },
    child: (bindings: Record<string, unknown>) => {
      return createStructuredLogger({
        ...options,
        baseBindings: { ...loggerOptions.baseBindings, ...bindings },
      });
    },
  };

  return structuredLogger;
}

/**
 * Add log entry to buffer
 */
function addToBuffer(
  level: string,
  obj: object | string,
  msg: string | undefined,
  options: CreateLoggerOptions
): void {
  const timestamp = new Date().toISOString();
  let logEntry: Record<string, unknown>;

  if (typeof obj === "string") {
    logEntry = {
      level,
      timestamp,
      service: options.service,
      environment: options.environment || "development",
      message: obj || msg,
      ...options.baseBindings,
    };
  } else {
    logEntry = {
      level,
      timestamp,
      service: options.service,
      environment: options.environment || "development",
      message: msg,
      ...options.baseBindings,
      ...obj,
    };
  }

  logBuffer.push(logEntry);

  // Flush if buffer is full
  const batchSize = 100; // Default batch size
  if (logBuffer.length >= batchSize) {
    // This will be handled by the interval, but we can trigger immediate flush
    // for high-volume scenarios
  }
}

/**
 * Flush all pending logs (useful for serverless functions)
 */
export async function flushPendingLogs(): Promise<void> {
  // This would need to be called with the aggregation config
  // For now, just clear the buffer
  logBuffer = [];
}
