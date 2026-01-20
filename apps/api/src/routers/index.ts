/**
 * App Router
 *
 * Composed router with all domain routers.
 * Split into separate files to avoid TypeScript TS7056 limits.
 */

import { healthRouter } from "./health";
import { projectsRouter } from "./projects";

export const appRouter = {
  health: healthRouter,
  projects: projectsRouter,
};

export type AppRouter = typeof appRouter;
