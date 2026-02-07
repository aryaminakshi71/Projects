import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { neonConfig } from "@neondatabase/serverless";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Hyperdrive connection string type
 */
export interface HyperdriveConnection {
  connectionString: string;
}

/**
 * Create a database client with automatic driver selection
 *
 * In Cloudflare Workers / Production (Neon):
 * - Uses Neon serverless driver (HTTP-based, optimized for edge)
 * - Configured via env.DATABASE.connectionString (Hyperdrive binding)
 *
 * In local development (localhost PostgreSQL):
 * - Uses node-postgres driver with connection pooling
 * - Configured via DATABASE_URL env var or parameter
 */
export function createDb(
  connectionString?: string | { connectionString: string },
) {
  let url: string;

  if (typeof connectionString === "string") {
    url = connectionString;
  } else if (connectionString && "connectionString" in connectionString) {
    url = connectionString.connectionString;
  } else {
    url = process.env.DATABASE_URL!;
  }

  // Detect local PostgreSQL vs Neon/production
  const isLocal = url.includes("localhost") || url.includes("127.0.0.1");

  if (isLocal) {
    // Use node-postgres for local development
    const pool = new Pool({
      connectionString: url,
      max: 20, // Maximum pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    return drizzlePg(pool, { schema });
  }

  // Use Neon serverless for production/Cloudflare Workers
  neonConfig.pipelineConnect = false;
  neonConfig.pipelineTLS = false;
  
  return drizzleNeon(url, { schema });
}

/**
 * Database client type
 */
export type Database = ReturnType<typeof createDb>;

// Re-export schema for convenience
export { schema };
