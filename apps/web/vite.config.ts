import { defineConfig, loadEnv } from 'vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import path from "path";

export default defineConfig(({ mode }) => {
  // Load env from root (../../)
  const env = loadEnv(mode, path.resolve(__dirname, "../../"), "");
  process.env = { ...process.env, ...env };

  return {
    // Vite equivalent of Next.js transpilePackages for monorepo workspace packages
    optimizeDeps: {
      // Exclude workspace packages so they are compiled as source
      exclude: [
        '@projects/env',
        "@projects/auth",
        "@projects/core",
        "@projects/storage",
        "@projects/api",
      ],
    },
    build: {
      target: "esnext",
      minify: "esbuild",
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
    },
    define: {
      __dirname: JSON.stringify(""),
    },
    server: {
      port: Number(process.env.PORT) || 3000,
      host: true,
      strictPort: false,
    },
    plugins: [
      viteTsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      ...(process.env.SKIP_CLOUDFLARE !== 'true' ? [
        cloudflare({
          viteEnvironment: { name: 'ssr' },
          persist: true,
        })
      ] : []),
      devtools(),
      tailwindcss(),
      tanstackStart({
        srcDirectory: "src",
        start: { entry: "./start.tsx" },
        server: { entry: "./server.ts" },
      }),
      viteReact(),
    ],
  };
})
