import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-foreground">Projects</h1>
        </div>
      </nav>
      <main className="container mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
