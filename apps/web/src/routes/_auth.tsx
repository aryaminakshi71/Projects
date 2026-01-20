/**
 * Auth Layout
 *
 * 2-column layout for authentication pages (login, signup, etc.)
 */

import { createFileRoute, Outlet, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left column - Branding */}
      <div className="relative hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary" />
        <div className="relative flex h-full flex-col justify-between p-10 text-primary-foreground">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground/20">
              <span className="text-sm font-bold">P</span>
            </div>
            {"Projects"}
          </Link>
          <div className="space-y-4">
            <blockquote className="text-xl font-medium">
              "Manage your projects with ease. Everything you need in one place."
            </blockquote>
            <footer className="text-sm opacity-80">
              — Happy Team
            </footer>
          </div>
        </div>
      </div>

      {/* Right column - Form */}
      <div className="flex flex-col">
        {/* Mobile header */}
        <div className="flex h-14 items-center border-b px-6 lg:hidden">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="flex size-6 items-center justify-center rounded bg-primary">
              <span className="text-xs font-bold text-primary-foreground">P</span>
            </div>
            {"Projects"}
          </Link>
        </div>

        {/* Form container */}
        <div className="flex flex-1 items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
