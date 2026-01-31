/**
 * App Router
 *
 * Composed router with all domain routers.
 * Split into separate files to avoid TypeScript TS7056 limits.
 */

import { healthRouter } from "./health";
import { projectsRouter } from "./projects";
import { assetsRouter } from "./assets";

export const appRouter = {
  health: healthRouter,
  projects: projectsRouter,
  assets: assetsRouter,
};

export type AppRouter = typeof appRouter;
