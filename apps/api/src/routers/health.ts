/**
 * Health Router
 *
 * Basic health check endpoint.
 */

import { z } from "zod";
import { pub } from "../procedures";

export const healthRouter = {
  check: pub
    .route({
      method: "GET",
      path: "/health",
      summary: "Health check",
      tags: ["System"],
    })
    .output(
      z.object({
        status: z.enum(["ok", "error"]),
        timestamp: z.string(),
        version: z.string(),
      }),
    )
    .handler(async () => {
      return {
        status: "ok" as const,
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      };
    }),
};
