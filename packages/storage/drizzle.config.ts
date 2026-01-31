import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Use root .env for credentials
dotenv.config({ path: '../../.env' });

export default defineConfig({
    schema: './src/db/schema/index.ts',
    out: '../../drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    verbose: true,
    strict: true,
});
