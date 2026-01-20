import { serve } from "@hono/node-server";
import { api as app } from "./app";

const port = 3001;

console.log(`🚀 Projects API server starting on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
}, (info: { port: number; address: string }) => {
  console.log(`✅ Projects API server running on http://localhost:${info.port}`);
});
