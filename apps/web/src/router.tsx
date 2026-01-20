import { createRouter } from "@tanstack/react-router";
// @ts-ignore - TanStack Router routeTree.gen.ts causes stack overflow due to complex generic types
import { routeTree } from "./routeTree.gen";

// Create the router instance
export function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });
}

// Type registration for TanStack Router
// Using any to avoid complex type inference that causes stack overflow
declare module "@tanstack/react-router" {
  interface Register {
    router: any;
  }
}
