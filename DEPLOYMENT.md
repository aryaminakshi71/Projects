# Deploying to GitHub & Cloudflare

Your application is a monorepo setup designed to be deployed on **Cloudflare**. While you push code to GitHub, the actual hosting and deployment will effectively happen on Cloudflare's infrastructure (Cloudflare Pages for frontend, Cloudflare Workers for backend), triggered by your GitHub activity.

## Prerequisites

1.  **Cloudflare Account**: [Sign up here](https://dash.cloudflare.com/sign-up).
2.  **GitHub Repository**: Push your code to a new GitHub repository.

## Step 1: Push to GitHub

If you haven't already:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## Step 2: Connect Cloudflare to GitHub

1.  Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com).
2.  Go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3.  Select your GitHub repository.

## Step 3: Configure Build Settings

Cloudflare will ask for build settings. Use these for your `apps/web` project:

*   **Production branch**: `main`
*   **Framework preset**: `Vite` (or `None`)
*   **Build command**: `npm run build` (or `turbo run build --filter=projects-web`)
*   **Build output directory**: `apps/web/dist`
*   **Environment variables**: 
    *   `NODE_VERSION`: `20` (or higher)

## Step 4: Deploying the API (Cloudflare Workers)

Your API is a Cloudflare Worker. You can deploy it automatically using GitHub Actions.

### Create a Workflow File

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-api:
    runs-on: ubuntu-latest
    name: Deploy API
    steps:
      - uses: actions/checkout@v4
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      
      - name: Install dependencies
        run: bun install
        
      - name: Deploy API
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          workingDirectory: apps/api
          command: deploy
```

### Set Secrets in GitHub

Go to your GitHub Repo -> **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**:

1.  `CLOUDFLARE_API_TOKEN`: Create this in your Cloudflare Profile > API Tokens (Template: *Edit Cloudflare Workers*).
2.  `CLOUDFLARE_ACCOUNT_ID`: Find this in your Cloudflare Dashboard URL or sidebar.

## Step 5: Verify

Once pushed, GitHub Actions will deploy your API to Cloudflare Workers, and Cloudflare Pages will build and deploy your frontend.
