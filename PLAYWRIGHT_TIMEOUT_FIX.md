# Projects Playwright Timeout Fix

## Issue

Playwright is timing out even though Vite reports "ready". The server shows:
```
VITE v7.3.1  ready in 3547 ms
➜  Local:   http://localhost:3001/
```

But Playwright still times out with:
```
Error: Timed out waiting 120000ms from config.webServer.
```

## Root Cause

The issue is that **Vite says "ready"** but the **TanStack Start SSR framework** needs additional time to initialize after Vite is ready. Playwright's HTTP health check is failing because the SSR server isn't fully initialized yet.

## Solution

1. **Skip Cloudflare Plugin**: Added `SKIP_CLOUDFLARE=true` to avoid Cloudflare plugin delays during tests
2. **Increased Timeout**: Changed from 120 seconds to 180 seconds (3 minutes) to allow TanStack Start to fully initialize
3. **Keep Output Visible**: Using `stdout: 'pipe'` to see server startup messages

## Changes Made

### `playwright.config.ts`
- Changed `command` to include `SKIP_CLOUDFLARE=true`
- Increased `timeout` from `120000` to `180000` (3 minutes)
- Added comments explaining the TanStack Start initialization delay

## Testing

Run the tests:
```bash
cd projects
bunx playwright test
```

The server should now have enough time to fully initialize before Playwright starts running tests.

## Alternative Solutions (if still timing out)

If the timeout still occurs, you can:

1. **Start server manually** before running tests:
   ```bash
   # Terminal 1
   cd projects/apps/web
   SKIP_CLOUDFLARE=true bun run dev
   
   # Terminal 2
   cd projects
   bunx playwright test
   ```

2. **Increase timeout further** if needed (up to 5 minutes for very slow systems)

3. **Check for blocking operations** in the server startup that might be causing delays
