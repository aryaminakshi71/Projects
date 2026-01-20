import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig(async () => {
  const react = (await import('@vitejs/plugin-react')).default
  return {
    plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./apps/web/src/__tests__/setup/vitest-setup.ts'],
    include: ['apps/web/src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['apps/web/src/**/*.{ts,tsx}'],
      exclude: [
        'apps/web/src/**/*.d.ts',
        'apps/web/src/**/*.test.{ts,tsx}',
        'apps/web/src/**/*.spec.{ts,tsx}',
        'apps/web/src/**/__tests__/**',
        'apps/web/src/**/__mocks__/**',
        'apps/web/src/app/**/layout.tsx',
        'apps/web/src/app/**/page.tsx',
        'apps/web/src/app/**/loading.tsx',
        'apps/web/src/app/**/error.tsx',
        'apps/web/src/app/**/not-found.tsx',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/web/src'),
      '@shared/saas-core': path.resolve(__dirname, './shared-saas-core'),
    },
  },
  }
})
