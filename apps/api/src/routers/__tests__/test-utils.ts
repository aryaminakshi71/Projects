/**
 * Test Utilities
 * 
 * Shared utilities for testing oRPC routers
 * Provides mock context creation and test data factories
 */

import type { OrgContext, InitialContext, AuthContext } from "../../context";
import type { Logger } from "@projects/logger";

/**
 * Create mock logger for tests
 */
export function createMockLogger(): Logger {
  return {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
    trace: () => {},
    child: () => createMockLogger(),
  };
}

/**
 * Create mock initial context
 */
export function createMockInitialContext(overrides: Partial<InitialContext> = {}): InitialContext {
  return {
    env: {
      DATABASE: { connectionString: process.env.TEST_DATABASE_URL || "postgresql://test" },
      CACHE: {} as KVNamespace,
      BETTER_AUTH_SECRET: "test-secret",
      VITE_PUBLIC_SITE_URL: "http://localhost:3000",
      NODE_ENV: "test",
      ...overrides.env,
    },
    headers: new Headers(overrides.headers || {}),
    requestId: overrides.requestId || "test-request-id",
    logger: overrides.logger || createMockLogger(),
  };
}

/**
 * Create mock auth context
 */
export function createMockAuthContext(overrides: Partial<AuthContext> = {}): AuthContext {
  const initialContext = createMockInitialContext(overrides);
  
  return {
    ...initialContext,
    auth: overrides.auth || ({} as any),
    user: overrides.user || {
      id: "test-user-id",
      email: "test@example.com",
      name: "Test User",
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any,
    session: overrides.session || {
      id: "test-session-id",
      userId: "test-user-id",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      token: "test-token",
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: null,
      userAgent: null,
      activeOrganizationId: "test-org-id",
    } as any,
  };
}

/**
 * Create mock organization context
 */
export function createMockOrgContext(overrides: Partial<OrgContext> = {}): OrgContext {
  const authContext = createMockAuthContext(overrides);
  
  return {
    ...authContext,
    organization: overrides.organization || {
      id: "test-org-id",
      name: "Test Organization",
      slug: "test-org",
      plan: "pro",
    },
    member: overrides.member || {
      id: "test-member-id",
      role: "owner" as const,
    },
  };
}

/**
 * Test data factory for organizations
 */
export async function createTestOrganization(
  db: any,
  data: {
    id?: string;
    name?: string;
    slug?: string;
    plan?: string;
  } = {}
) {
  const { organizations } = await import("@projects/storage/db/schema");
  
  const [org] = await db
    .insert(organizations)
    .values({
      id: data.id || crypto.randomUUID(),
      name: data.name || "Test Organization",
      slug: data.slug || `test-org-${Date.now()}`,
      plan: data.plan || "free",
    })
    .returning();
  
  return org;
}

/**
 * Test data factory for users
 */
export async function createTestUser(
  db: any,
  data: {
    id?: string;
    email?: string;
    name?: string;
  } = {}
) {
  const { users } = await import("@projects/storage/db/schema");
  
  const [user] = await db
    .insert(users)
    .values({
      id: data.id || crypto.randomUUID(),
      email: data.email || `test-${Date.now()}@example.com`,
      name: data.name || "Test User",
      emailVerified: true,
    })
    .returning();
  
  return user;
}

/**
 * Test data factory for projects
 */
export async function createTestProject(
  db: any,
  context: OrgContext,
  data: {
    id?: string;
    name?: string;
    description?: string;
    status?: string;
  } = {}
) {
  const { projects } = await import("@projects/storage/db/schema");
  
  const [project] = await db
    .insert(projects)
    .values({
      id: data.id || crypto.randomUUID(),
      organizationId: context.organization.id,
      name: data.name || "Test Project",
      description: data.description || "Test Description",
      status: (data.status as any) || "planning",
      isActive: true,
    })
    .returning();
  
  return project;
}

/**
 * Clean up test data
 */
export async function cleanupTestData(db: any, tables: any[]) {
  // Delete in reverse order to respect foreign key constraints
  for (const table of tables.reverse()) {
    try {
      await db.delete(table);
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}
