# Environment Setup Scripts

Helper scripts for managing environment variables in this Next.js 16 project.

## Scripts

### `setup-env.sh`
Interactive script to set up your local environment.

**Usage:**
```bash
./scripts/setup-env.sh
```

**Features:**
- Creates `.env.local` from `.env.example` if it doesn't exist
- Generates secure JWT secrets automatically
- Validates required environment variables
- Checks configuration status

### `check-env.sh`
Scans the codebase to find all environment variables and compares them with `.env.example`.

**Usage:**
```bash
./scripts/check-env.sh
```

**Features:**
- Lists all `process.env.*` references in the codebase
- Identifies undocumented variables
- Highlights unused variables in `.env.example`

## Environment Files

### `.env.example` (Template)
- **Purpose:** Template file with all possible environment variables
- **Status:** Committed to git
- **Action:** Copy to `.env.local` and fill in actual values

### `.env.local` (Local Development)
- **Purpose:** Your local development environment variables
- **Status:** **NEVER commit to git** (already in `.gitignore`)
- **Priority:** Highest priority in Next.js 16
- **Action:** Fill in your actual secrets and configuration

### `.env` (Base Config - Optional)
- **Purpose:** Base environment configuration
- **Status:** Can be removed if redundant (Next.js 16 prioritizes `.env.local`)
- **Action:** Review contents, remove if only contains defaults

## Required Variables

### Critical (Application won't start without these):
- `JWT_SECRET` - Minimum 32 characters, generate with: `openssl rand -base64 32`
- `JWT_REFRESH_SECRET` - Minimum 32 characters, generate with: `openssl rand -base64 32`
- `DATABASE_URL` - PostgreSQL connection string (or use individual `DB_*` variables)
- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST API URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST API token

### Optional (Features work without these):
- Stripe integration (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)
- Email service (`RESEND_API_KEY`, `EMAIL_PROVIDER`, etc.)
- Analytics (`NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_SENTRY_DSN`, etc.)
- Webhooks (`GITHUB_WEBHOOK_SECRET`, `SLACK_SIGNING_SECRET`, etc.)

## Quick Start

1. **Run the setup script:**
   ```bash
   ./scripts/setup-env.sh
   ```

2. **Edit `.env.local`** with your actual values:
   ```bash
   # Required: Update these
   JWT_SECRET=your-actual-secret-here
   JWT_REFRESH_SECRET=your-actual-refresh-secret-here
   DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
   UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token
   ```

3. **Verify configuration:**
   ```bash
   ./scripts/check-env.sh
   ```

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env.local` to version control
- Use strong, unique secrets in production
- Rotate secrets regularly
- Use different secrets for development and production
- `.env.example` should only contain placeholders, never real secrets

## Next.js 16 Environment Variable Priority

Next.js 16 loads environment files in this order (later files override earlier ones):
1. `.env`
2. `.env.local` ← **Highest priority**
3. `.env.development` / `.env.production` (based on NODE_ENV)
4. `.env.development.local` / `.env.production.local`

Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.
