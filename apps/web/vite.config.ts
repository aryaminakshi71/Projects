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
      "@projects/logger",
    ],
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
