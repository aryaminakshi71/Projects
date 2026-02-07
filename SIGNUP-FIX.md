# Signup Fix Documentation

## Issue Summary
The `/signup` route authentication was failing with a 500 error due to database adapter configuration issues.

## Problems Fixed

### 1. ✅ Table Naming Convention
**Problem:** Better Auth Drizzle adapter was configured with `usePlural: true` but schema uses singular table names.

**Fix Applied:**
```typescript
// packages/auth/src/index.ts
database: drizzleAdapter(db, {
  provider: "pg",
  // Changed from usePlural: true to false
})
```

### 2. ⚠️ Database Driver Compatibility (Remaining Issue)
**Problem:** The Neon serverless driver (`@neondatabase/serverless`) is optimized for Neon's HTTP protocol but has issues with local PostgreSQL connections.

**Error:**
```
query: 'select ... from "user" where "user"."email" = $1',
cause: ErrorEvent
```

## Current Status

✅ **Working:**
- Signup page renders correctly at `/signup`
- Form displays with all required fields (name, email, password)
- Terms checkbox and OAuth buttons present
- Database tables exist and are properly structured

❌ **Not Working:**
- Actual signup submission fails with 500 error
- Database queries not executing properly

## Recommended Solutions

### Option 1: Use Neon Database (Recommended)
Since this project is configured for Cloudflare Workers deployment with Neon, use a Neon database even for local development:

1. Create a Neon database at https://neon.tech
2. Update `.env` file:
```env
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/projects?sslmode=require"
```

### Option 2: Configure node-postgres for Local Dev
Add a fallback to use node-postgres for local development:

```typescript
// packages/storage/src/db/client.ts
import { drizzle as drizzleNeonless } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export function createDb(connectionString?: string | { connectionString: string }) {
  let url: string;
  // ... existing code ...
  
  //  For local development with local Postgres
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    const pool = new Pool({ connectionString: url });
    return drizzlePg(pool, { schema });
  }
  
  // For Neon/production
  return drizzleNeonless(url, { schema });
}
```

Then add dependency:
```bash
bun add pg
bun add -D @types/pg
```

### Option 3: Use Docker Postgres with Neon-compatible setup
Configure local Postgres to match Neon's configuration more closely.

## Files Modified

1. ✅ `/packages/auth/src/index.ts` - Fixed usePlural configuration

## Testing Signup

After fixing the database driver issue, test with:

```bash
curl -X POST http://localhost:3001/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

Expected response should include session cookies and user data.

## Next Steps

1. Choose one of the solutions above
2. Apply the fix
3. Restart the dev server
4. Test signup functionality in browser at http://localhost:3001/signup
5. Verify user is created in database
6. Confirm session cookies are set
7. Test navigation to /app after signup

## Related Files

- `/apps/web/src/routes/_auth/signup.tsx` - Signup route ✅
- `/apps/web/src/components/auth/signup-form.tsx` - Signup form component ✅  
- `/packages/auth/src/index.ts` - Auth configuration ⚠️ (needs driver fix)
- `/packages/storage/src/db/client.ts` - Database client ⚠️ (needs update)
- `/apps/api/src/app.ts` - API routes including auth ✅

---

**Status:** Partially fixed - Page works, API needs database driver configuration
**Priority:** High - Blocks user registration
**Estimated Fix Time:** 10-15 minutes with Option 1 or 2
