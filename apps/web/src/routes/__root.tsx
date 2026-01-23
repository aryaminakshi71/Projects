import {
  HeadContent,
  Scripts,
  createRootRoute,
  Outlet,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PostHogProvider } from '@/components/providers/posthog-provider'

const queryClient = new QueryClient()

import appCss from '@/styles/globals.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Projects' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  component: RootDocument,
})

function RootDocument() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <PostHogProvider>
          <QueryClientProvider client={queryClient}>
            <Outlet />
            <Toaster position="top-right" richColors />
            {import.meta.env.PROD ? null : <TanStackRouterDevtools />}
            <Scripts />
          </QueryClientProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
