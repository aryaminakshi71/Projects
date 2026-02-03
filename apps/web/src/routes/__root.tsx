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
import { ErrorPage, NotFoundPage } from '@/components/error'
import { generateOrganizationSchema, generateWebSiteSchema, getProjectsOrganizationSchema } from '@/lib/structured-data'
import { registerServiceWorker } from '@/lib/service-worker'
import { addSkipLink } from '@/lib/accessibility'
import { useEffect } from 'react'

const queryClient = new QueryClient()

import appCss from '@/styles/globals.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Projects - Project Management & Collaboration Platform' },
      { name: 'description', content: 'Comprehensive project management platform for teams. Plan, track, and collaborate on projects with task management, timelines, and team collaboration tools.' },
      { name: 'keywords', content: 'project management, task management, team collaboration, project tracking, agile project management, team productivity' },
      { property: 'og:title', content: 'Projects - Project Management Platform' },
      { property: 'og:description', content: 'Plan, track, and collaborate on projects with our comprehensive platform.' },
      { property: 'og:type', content: 'website' },
      { name: 'robots', content: 'index, follow' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'dns-prefetch', href: 'https://api.your-domain.com' },
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  component: RootDocument,
  errorComponent: ({ error }) => <ErrorPage error={error} />,
  notFoundComponent: () => <NotFoundPage />,
})

function RootDocument() {
  // Register service worker for offline support
  useEffect(() => {
    registerServiceWorker();
    // Add skip link for accessibility
    addSkipLink("main-content", "Skip to main content");
  }, []);

  const organizationSchema = generateOrganizationSchema(getProjectsOrganizationSchema())
  const websiteSchema = generateWebSiteSchema({
    name: 'Projects Management',
    url: import.meta.env.VITE_PUBLIC_SITE_URL || 'https://projects.your-domain.com',
    description: 'Project management platform for teams to collaborate and deliver projects.',
  })

  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white focus:rounded-br-lg"
        >
          Skip to main content
        </a>
        <PostHogProvider>
          <QueryClientProvider client={queryClient}>
            <main id="main-content" tabIndex={-1}>
              <Outlet />
            </main>
            <Toaster position="top-right" richColors />
            {import.meta.env.PROD ? null : <TanStackRouterDevtools />}
            <Scripts />
          </QueryClientProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
