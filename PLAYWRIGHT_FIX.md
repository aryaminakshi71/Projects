# Projects Playwright Configuration Fix

## Issues Fixed

### 1. Port Mismatch
- **Problem:** Playwright config and e2e tests were using port `3003`, but the web app runs on port `3001`
- **Fix:** Updated all references from `3003` to `3001`

### 2. Wrong Package Manager
- **Problem:** Playwright config was using `npm run dev`, but the project uses `bun`
- **Fix:** Changed command to `cd apps/web && bun run dev`

### 3. Server Output Visibility
- **Problem:** `stdout: 'ignore'` was hiding server startup messages
- **Fix:** Changed to `stdout: 'pipe'` to see server output for debugging

## Files Updated

1. `playwright.config.ts`
   - Changed `baseURL` from `http://localhost:3003` to `http://localhost:3001`
   - Changed `webServer.url` from `http://localhost:3003` to `http://localhost:3001`
   - Changed `webServer.command` from `npm run dev` to `cd apps/web && bun run dev`
   - Changed `stdout` from `'ignore'` to `'pipe'`

2. `e2e/projects.e2e.test.ts`
   - Changed `BASE_URL` from `http://localhost:3003` to `http://localhost:3001`

3. `e2e/app.spec.ts`
   - Updated all `http://localhost:3003` references to `http://localhost:3001`

4. `e2e/projects.spec.ts`
   - Updated all `http://localhost:3003` references to `http://localhost:3001`

## Testing

To run the e2e tests:

```bash
cd projects
bunx playwright test
```

The web server will automatically start on port 3001 before running tests.

## Notes

- The web server command runs from the project root, so we need to `cd apps/web` first
- `reuseExistingServer: !process.env.CI` will reuse an existing server if one is already running (useful for local development)
- Server timeout is set to 120 seconds (2 minutes) which should be enough for the dev server to start
