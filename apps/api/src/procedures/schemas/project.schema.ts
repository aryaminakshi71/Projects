/**
 * Output schemas for project procedures
 */

import { z } from "zod";

export const projectOutputSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  priority: z.string().nullable(),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
  budget: z.string().nullable(),
  projectManagerId: z.string().nullable(),
  assignedTo: z.string().nullable(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().nullable(),
});

export const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const projectListOutputSchema = z.object({
  data: z.array(projectOutputSchema),
  pagination: paginationSchema,
});

export const projectOutputSchemaSingle = projectOutputSchema;
