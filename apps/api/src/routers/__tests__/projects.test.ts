/**
 * Projects Router Tests
 * 
 * Tests for the projects API router
 */

import { describe, it, expect, beforeEach } from "vitest";
import { projectsRouter } from "../projects";
import { createMockOrgContext, createTestOrganization, createTestProject, createTestUser } from "./test-utils";
import { testDb, hasDatabase } from "./setup";
import { schema } from "../../procedures";
import { eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";

describe("Projects Router", () => {
  let context: ReturnType<typeof createMockOrgContext>;
  let testOrgId: string;
  let testUserId: string;

  beforeEach(async () => {
    if (!hasDatabase || !testDb) {
      return;
    }

    // Clean up test data
    await testDb.delete(schema.projects);
    await testDb.delete(schema.member);
    await testDb.delete(schema.organization);
    await testDb.delete(schema.user);

    // Create test organization and user
    const org = await createTestOrganization(testDb, {
      name: "Test Organization",
      slug: `test-org-${Date.now()}`,
    });
    testOrgId = org.id;

    const user = await createTestUser(testDb, {
      email: `test-${Date.now()}@example.com`,
    });
    testUserId = user.id;

    // Create mock context with real org and user
    context = createMockOrgContext({
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        plan: org.plan || "free",
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.name || "Test User",
        emailVerified: true,
        image: null,
        createdAt: user.createdAt || new Date(),
        updatedAt: user.updatedAt || new Date(),
      } as any,
    });
  });

  describe("list", () => {
    it.skipIf(!hasDatabase || !testDb)("should return paginated projects", async () => {
      // Create multiple test projects
      const project1 = await createTestProject(testDb, context, { name: "Project One", status: "active" });
      const project2 = await createTestProject(testDb, context, { name: "Project Two", status: "planning" });
      const project3 = await createTestProject(testDb, context, { name: "Project Three", status: "active" });

      // Call list endpoint
      const result = await projectsRouter.list.handler({
        context,
        input: { limit: 2, offset: 0 },
      });

      // Assert results
      expect(result.projects).toBeDefined();
      expect(Array.isArray(result.projects)).toBe(true);
      expect(result.total).toBeGreaterThanOrEqual(3);
      expect(result.projects.length).toBeLessThanOrEqual(2);
    });

    it.skipIf(!hasDatabase || !testDb)("should filter by search query", async () => {
      // Create test projects with different names
      await createTestProject(testDb, context, { name: "Alpha Project", description: "Alpha description" });
      await createTestProject(testDb, context, { name: "Beta Project", description: "Beta description" });
      await createTestProject(testDb, context, { name: "Gamma Project", description: "Gamma description" });

      // Call list with search query
      const result = await projectsRouter.list.handler({
        context,
        input: { search: "Alpha", limit: 50, offset: 0 },
      });

      // Assert only matching projects are returned
      expect(result.projects.length).toBeGreaterThan(0);
      expect(result.projects.every((p: any) => 
        p.name.toLowerCase().includes("alpha") || 
        p.description?.toLowerCase().includes("alpha")
      )).toBe(true);
    });

    it.skipIf(!hasDatabase || !testDb)("should filter by status", async () => {
      // Create test projects with different statuses
      await createTestProject(testDb, context, { name: "Active Project", status: "active" });
      await createTestProject(testDb, context, { name: "Planning Project", status: "planning" });
      await createTestProject(testDb, context, { name: "Another Active", status: "active" });

      // Call list with status filter
      const result = await projectsRouter.list.handler({
        context,
        input: { status: "active", limit: 50, offset: 0 },
      });

      // Assert only projects with matching status are returned
      expect(result.projects.length).toBeGreaterThan(0);
      expect(result.projects.every((p: any) => p.status === "active")).toBe(true);
    });

    it.skipIf(!hasDatabase || !testDb)("should handle empty results", async () => {
      // Ensure no projects exist (already cleaned in beforeEach)
      
      // Call list endpoint
      const result = await projectsRouter.list.handler({
        context,
        input: { limit: 50, offset: 0 },
      });

      // Assert empty array and total: 0
      expect(result.projects).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe("get", () => {
    it.skipIf(!hasDatabase || !testDb)("should return single project", async () => {
      // Create test project
      const testProject = await createTestProject(testDb, context, {
        name: "Test Project",
        description: "Test Description",
      });

      // Call get with project ID
      const result = await projectsRouter.get.handler({
        context,
        input: { id: testProject.id },
      });

      // Assert correct project is returned
      expect(result).toBeDefined();
      expect(result.id).toBe(testProject.id);
      expect(result.name).toBe("Test Project");
      expect(result.description).toBe("Test Description");
    });

    it.skipIf(!hasDatabase || !testDb)("should return 404 for non-existent project", async () => {
      // Call get with non-existent ID
      const nonExistentId = crypto.randomUUID();

      // Assert ORPCError with NOT_FOUND code is thrown
      await expect(
        projectsRouter.get.handler({
          context,
          input: { id: nonExistentId },
        })
      ).rejects.toThrow(ORPCError);
      
      try {
        await projectsRouter.get.handler({
          context,
          input: { id: nonExistentId },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ORPCError);
        expect((error as ORPCError).code).toBe("NOT_FOUND");
      }
    });
  });

  describe("create", () => {
    it.skipIf(!hasDatabase || !testDb)("should create new project", async () => {
      // Prepare project input data
      const input = {
        name: "New Test Project",
        description: "Test Description",
        status: "planning" as const,
        priority: "high" as const,
      };

      // Call create endpoint
      const result = await projectsRouter.create.handler({
        context,
        input,
      });

      // Assert project is created with correct data
      expect(result).toBeDefined();
      expect(result.name).toBe("New Test Project");
      expect(result.description).toBe("Test Description");
      expect(result.status).toBe("planning");
      expect(result.organizationId).toBe(context.organization.id);
      expect(result.createdBy).toBe(context.user.id);

      // Verify project exists in database
      const [dbProject] = await testDb
        .select()
        .from(schema.projects)
        .where(eq(schema.projects.id, result.id))
        .limit(1);
      expect(dbProject).toBeDefined();
      expect(dbProject.name).toBe("New Test Project");
    });

    it.skipIf(!hasDatabase || !testDb)("should validate input", async () => {
      // Call create with invalid input (missing required fields)
      await expect(
        projectsRouter.create.handler({
          context,
          input: {
            name: "", // Invalid: empty string
          } as any,
        })
      ).rejects.toThrow();
    });
  });

  describe("update", () => {
    it.skipIf(!hasDatabase || !testDb)("should update existing project", async () => {
      // Create test project
      const testProject = await createTestProject(testDb, context, {
        name: "Original Name",
        status: "planning",
      });

      // Call update with modified data
      const result = await projectsRouter.update.handler({
        context,
        input: {
          id: testProject.id,
          name: "Updated Name",
          status: "active",
        },
      });

      // Assert project is updated correctly
      expect(result).toBeDefined();
      expect(result.name).toBe("Updated Name");
      expect(result.status).toBe("active");

      // Verify changes persist in database
      const [dbProject] = await testDb
        .select()
        .from(schema.projects)
        .where(eq(schema.projects.id, testProject.id))
        .limit(1);
      expect(dbProject.name).toBe("Updated Name");
      expect(dbProject.status).toBe("active");
    });
  });

  describe("delete", () => {
    it.skipIf(!hasDatabase || !testDb)("should delete project", async () => {
      // Create test project
      const testProject = await createTestProject(testDb, context, {
        name: "Project to Delete",
      });

      // Call delete endpoint
      const result = await projectsRouter.delete.handler({
        context,
        input: {
          id: testProject.id,
        },
      });

      // Assert project is deleted (soft delete - isActive: false)
      expect(result.success).toBe(true);

      // Verify project no longer appears in list
      const listResult = await projectsRouter.list.handler({
        context,
        input: { limit: 50, offset: 0 },
      });
      expect(listResult.projects.find((p: any) => p.id === testProject.id)).toBeUndefined();
    });
  });
});
