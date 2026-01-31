import { defineConfig } from 'vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  // Vite equivalent of Next.js transpilePackages for monorepo workspace packages
  optimizeDeps: {
    include: [
      '@projects/env',
      "@projects/auth",
      "@projects/core",
      "@projects/storage",
      "@orpc/client",
      "@tanstack/react-query",
      "@tanstack/react-router",
    ],
    // Exclude problematic packages from optimization
    exclude: ["@tanstack/react-router-devtools"],
  },
  build: {
    // Optimize build output
    target: "esnext",
    minify: "esbuild",
    sourcemap: false, // Disable sourcemaps in production for smaller bundles
    rollupOptions: {
      output: {
        // Better chunk splitting for code splitting
        // Note: React/React-DOM are external in SSR builds, so don't include them in manualChunks
        manualChunks: {
          'tanstack-vendor': [
            '@tanstack/react-query',
            '@tanstack/react-router',
            '@tanstack/react-start',
          ],
          'orpc-vendor': ['@orpc/client', '@orpc/tanstack-query'],
        },
      },
    },
    // Increase chunk size warning limit (default is 500kb)
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3005,
    // Proxy API requests to avoid server-side handler issues
    // Note: In development, API runs on port 3001 via apps/api/src/server.ts
    // Proxy removed to avoid self-proxying loop. API is handled by api.$.ts route.
    // proxy: {
    //   '/api': {
    //     target: process.env.API_URL || 'http://localhost:3001',
    //     changeOrigin: true,
    //     secure: false,
    //     configure: (proxy, _options) => {
    //       proxy.on('error', (err, _req, res) => {
    //         console.log('proxy error', err);
    //       });
    //     },
    //   },
    // },
  },
  plugins: [
    // Path aliases from tsconfig
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    // Cloudflare Workers integration (must be before tanstackStart)
    // Only include if not skipping Cloudflare (for testing routes without Cloudflare services)
    // Note: If remote API fails, use SKIP_CLOUDFLARE=true to run without Cloudflare features
    ...(process.env.SKIP_CLOUDFLARE !== 'true' ? [
      cloudflare({
        viteEnvironment: { name: 'ssr' },
        persist: true,
        // Try to use local mode - may still attempt remote API call
        // If this fails, use: SKIP_CLOUDFLARE=true bun run dev
      })
    ] : []),
    // TanStack devtools
    devtools(),
    // Tailwind CSS v4
    tailwindcss(),
    // TanStack Start SSR framework
    tanstackStart({
      srcDirectory: "src",
      start: { entry: "./start.tsx" },
      server: { entry: "./server.ts" },
    }),
    // React with compiler optimization
    viteReact(),
  ],
})

export default config
