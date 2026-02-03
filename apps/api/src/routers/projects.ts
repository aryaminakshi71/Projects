/**
 * Projects Router
 *
 * Project management operations.
 */

import { z } from "zod";
import { orgAuthed, getDb, schema } from "../procedures";
import { eq, and, or, ilike, desc, sql, count } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { getOrCache } from "@projects/storage/redis";
import type { OrgContext } from "../context";

export const projectsRouter = {
  /**
   * List projects for the organization
   */
  list: orgAuthed
    .route({
      method: "GET",
      path: "/projects",
      summary: "List projects",
      tags: ["Projects"],
    })
    .input(
      z.object({
        search: z.string().optional(),
        status: z.enum(["planning", "active", "on_hold", "completed", "cancelled"]).optional(),
        limit: z.number().min(1).max(200).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .output(
      z.object({
        projects: z.array(z.any()),
        total: z.number(),
      })
    )
    .handler(async ({ context, input }: { context: OrgContext; input: { search?: string; status?: string; limit: number; offset: number } }) => {
      const db = getDb(context);
      const { search, status, limit, offset } = input;

      // Cache key for list queries
      const cacheKey = `projects:list:${context.organization.id}:${JSON.stringify(input)}`;

      // Use cache for list queries (5 min TTL)
      return getOrCache(
        cacheKey,
        async () => {
          // Build where conditions
          const conditions = [
            eq(schema.projects.organizationId, context.organization.id),
            eq(schema.projects.isActive, true),
          ];

          // Filter by status if provided
          if (status) {
            conditions.push(eq(schema.projects.status, status));
          }

          // Search filter
          if (search) {
            conditions.push(
              or(
                ilike(schema.projects.name, `%${search}%`),
                ilike(schema.projects.description, `%${search}%`)
              )!
            );
          }

          const whereClause = and(...conditions);

          // Execute queries in parallel for better performance
          const [projectsResult, countResult] = await Promise.all([
            db
              .select()
              .from(schema.projects)
              .where(whereClause)
              .orderBy(desc(schema.projects.createdAt))
              .limit(limit)
              .offset(offset),
            db
              .select({ count: sql<number>`count(*)` })
              .from(schema.projects)
              .where(whereClause),
          ]);

          return {
            projects: projectsResult,
            total: Number(countResult[0]?.count || 0),
          };
        },
        300 // 5 minutes
      );
    }),

  /**
   * Get a single project
   */
  get: orgAuthed
    .route({
      method: "GET",
      path: "/projects/:id",
      summary: "Get project",
      tags: ["Projects"],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .handler(async ({ context, input }: { context: OrgContext; input: { id: string } }) => {
      const db = getDb(context);
      const { id } = input;

      const [project] = await db
        .select()
        .from(schema.projects)
        .where(
          and(
            eq(schema.projects.id, id),
            eq(schema.projects.organizationId, context.organization.id)
          )
        )
        .limit(1);

      if (!project) {
        throw new ORPCError("NOT_FOUND", {
          message: "Project not found",
        });
      }

      return project;
    }),

  /**
   * Create a new project
   */
  create: orgAuthed
    .route({
      method: "POST",
      path: "/projects",
      summary: "Create project",
      tags: ["Projects"],
    })
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        status: z.enum(["planning", "active", "on_hold", "completed", "cancelled"]).default("planning"),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        deadline: z.string().datetime().optional(),
        budget: z.number().optional(),
      })
    )
    .output(z.any())
    .handler(async ({ context, input }: { context: OrgContext; input: { name: string; description?: string; status?: string; priority?: string; startDate?: string; endDate?: string; deadline?: string; budget?: number } }) => {
      const db = getDb(context);

      const [newProject] = await db
        .insert(schema.projects)
        .values({
          organizationId: context.organization.id,
          name: input.name,
          description: input.description,
          status: (input.status as any) || "planning",
          priority: (input.priority as any),
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
          deadline: input.deadline ? new Date(input.deadline) : undefined,
          budget: input.budget?.toString(),
          isActive: true,
          createdBy: context.user.id,
        })
        .returning();

      // Invalidate cache
      await import("@projects/storage/redis").then(({ invalidateCache }) => {
        return invalidateCache(`projects:list:${context.organization.id}:*`);
      });

      return newProject;
    }),

  /**
   * Update a project
   */
  update: orgAuthed
    .route({
      method: "PUT",
      path: "/projects/:id",
      summary: "Update project",
      tags: ["Projects"],
    })
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        status: z.enum(["planning", "active", "on_hold", "completed", "cancelled"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        deadline: z.string().datetime().optional(),
        budget: z.number().optional(),
      })
    )
    .output(z.any())
    .handler(async ({ context, input }: { context: OrgContext; input: { id: string; name?: string; description?: string; status?: string; priority?: string; startDate?: string; endDate?: string; deadline?: string; budget?: number } }) => {
      const db = getDb(context);
      const { id, ...updateData } = input;

      // Verify project exists and belongs to organization
      const existingProject = await db
        .select()
        .from(schema.projects)
        .where(
          and(
            eq(schema.projects.id, id),
            eq(schema.projects.organizationId, context.organization.id)
          )
        )
        .limit(1);

      if (!existingProject[0]) {
        throw new ORPCError("NOT_FOUND", {
          message: "Project not found",
        });
      }

      // Build update object
      const updateValues: any = {
        updatedAt: new Date(),
      };

      if (updateData.name !== undefined) updateValues.name = updateData.name;
      if (updateData.description !== undefined) updateValues.description = updateData.description;
      if (updateData.status !== undefined) updateValues.status = updateData.status;
      if (updateData.priority !== undefined) updateValues.priority = updateData.priority;
      if (updateData.startDate !== undefined) updateValues.startDate = new Date(updateData.startDate);
      if (updateData.endDate !== undefined) updateValues.endDate = new Date(updateData.endDate);
      if (updateData.deadline !== undefined) updateValues.deadline = new Date(updateData.deadline);
      if (updateData.budget !== undefined) updateValues.budget = updateData.budget.toString();

      const [updatedProject] = await db
        .update(schema.projects)
        .set(updateValues)
        .where(
          and(
            eq(schema.projects.id, id),
            eq(schema.projects.organizationId, context.organization.id)
          )
        )
        .returning();

      // Invalidate cache
      await import("@projects/storage/redis").then(({ invalidateCache }) => {
        return Promise.all([
          invalidateCache(`projects:list:${context.organization.id}:*`),
          invalidateCache(`project:${id}:${context.organization.id}`),
        ]);
      });

      return updatedProject;
    }),

  /**
   * Delete a project (soft delete)
   */
  delete: orgAuthed
    .route({
      method: "DELETE",
      path: "/projects/:id",
      summary: "Delete project",
      tags: ["Projects"],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context, input }: { context: OrgContext; input: { id: string } }) => {
      const db = getDb(context);

      // Verify project exists
      const existingProject = await db
        .select()
        .from(schema.projects)
        .where(
          and(
            eq(schema.projects.id, input.id),
            eq(schema.projects.organizationId, context.organization.id)
          )
        )
        .limit(1);

      if (!existingProject[0]) {
        throw new ORPCError("NOT_FOUND", {
          message: "Project not found",
        });
      }

      // Soft delete by setting isActive to false
      await db
        .update(schema.projects)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.projects.id, input.id),
            eq(schema.projects.organizationId, context.organization.id)
          )
        );

      // Invalidate cache
      await import("@projects/storage/redis").then(({ invalidateCache }) => {
        return Promise.all([
          invalidateCache(`projects:list:${context.organization.id}:*`),
          invalidateCache(`project:${input.id}:${context.organization.id}`),
        ]);
      });

      return { success: true };
    }),
};
