/**
 * Health check routes
 */

import { Hono } from "hono";

const health = new Hono();

health.get("/", (c: any) => {
  return c.json({
    status: "ok",
    service: "projects-api",
    timestamp: new Date().toISOString(),
  });
});

export const healthRoutes = health;
