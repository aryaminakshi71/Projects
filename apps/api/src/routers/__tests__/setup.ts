/**
 * Test Setup for Projects App
 * 
 * Global test configuration and database connection
 */

import { beforeAll, afterAll } from 'vitest';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

let testDb: ReturnType<typeof drizzle> | null = null;
let testClient: ReturnType<typeof postgres> | null = null;
let hasDatabase = false;

beforeAll(async () => {
  // Setup test database connection
  const connectionString = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn('TEST_DATABASE_URL or DATABASE_URL not set - database tests will be skipped');
    return;
  }

  try {
    testClient = postgres(connectionString, {
      max: 1, // Use single connection for tests
      idle_timeout: 20,
      connect_timeout: 10,
    });
    testDb = drizzle(testClient);
    
    // Test the connection
    await testClient`SELECT 1`;
    hasDatabase = true;
  } catch (error) {
    console.warn('Failed to connect to test database - database tests will be skipped:', error);
    hasDatabase = false;
    if (testClient) {
      await testClient.end();
      testClient = null;
      testDb = null;
    }
  }
});

afterAll(async () => {
  // Cleanup
  if (testClient) {
    try {
      await testClient.end();
    } catch (error) {
      // Ignore cleanup errors
    }
  }
});

export { testDb, testClient, hasDatabase };
