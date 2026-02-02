/**
 * Datadog APM Integration - Mocked for Cloudflare/Dev
 */

// Mock tracer object matching the used interface
export const tracer = {
  trace: <T>(name: string, options: any, callback: () => T) => callback(),
  use: () => ({
    addTags: () => { },
    setError: () => { },
  }),
  init: () => { },
};

export function initDatadog() {
  // No-op
}

export function createSpan<T>(
  name: string,
  operation: string,
  callback: () => T | Promise<T>
): T | Promise<T> {
  return callback();
}

export function addTags(tags: Record<string, string | number | boolean>): void {
  // No-op
}

export function setError(error: Error): void {
  // No-op
}
