import { pgTable, uuid, varchar, text, boolean, timestamp, integer, numeric, index } from 'drizzle-orm/pg-core';
import { user, organization } from './auth.schema';

/**
 * Projects-Specific Schema
 * Only tables used by the Projects application
 */

// Projects table - Projects specific
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: text('organization_id').notNull().references(() => organization.id, { onDelete: 'cascade' }), // Better Auth organization ID
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('planning').notNull(), // 'planning', 'active', 'on_hold', 'completed', 'cancelled'
  priority: varchar('priority', { length: 20 }).default('medium'), // 'low', 'medium', 'high', 'urgent'
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  deadline: timestamp('deadline'),
  budget: numeric('budget', { precision: 15, scale: 2 }),
  spent: numeric('spent', { precision: 15, scale: 2 }).default('0'),
  progress: integer('progress').default(0), // 0-100 percentage
  clientId: uuid('client_id'),
  projectManagerId: text('project_manager_id').references(() => user.id, { onDelete: 'set null' }), // Better Auth user ID
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: text('created_by').notNull().references(() => user.id), // Better Auth user ID
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  organizationIdIdx: index('idx_projects_organization_id').on(table.organizationId),
  statusIdx: index('idx_projects_status').on(table.status),
  projectManagerIdIdx: index('idx_projects_project_manager_id').on(table.projectManagerId),
  clientIdIdx: index('idx_projects_client_id').on(table.clientId),
}));

// Tasks table - Projects specific
export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('todo').notNull(), // 'todo', 'in_progress', 'review', 'done', 'blocked'
  priority: varchar('priority', { length: 20 }).default('medium'), // 'low', 'medium', 'high', 'urgent'
  assignedTo: text('assigned_to').references(() => user.id, { onDelete: 'set null' }), // Better Auth user ID
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),
  estimatedHours: numeric('estimated_hours', { precision: 10, scale: 2 }),
  actualHours: numeric('actual_hours', { precision: 10, scale: 2 }),
  progress: integer('progress').default(0), // 0-100 percentage
  parentTaskId: uuid('parent_task_id'), // For subtasks
  sortOrder: integer('sort_order').default(0),
  createdBy: text('created_by').notNull().references(() => user.id), // Better Auth user ID
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  projectIdIdx: index('idx_tasks_project_id').on(table.projectId),
  assignedToIdx: index('idx_tasks_assigned_to').on(table.assignedTo),
  statusIdx: index('idx_tasks_status').on(table.status),
  parentTaskIdIdx: index('idx_tasks_parent_task_id').on(table.parentTaskId),
}));

// Project members table - Projects specific
export const projectMembers = pgTable('project_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }), // Better Auth user ID
  role: varchar('role', { length: 50 }).default('member'), // 'owner', 'manager', 'member', 'viewer'
  permissions: text('permissions').array(), // Array of permission strings
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  leftAt: timestamp('left_at'),
}, (table) => ({
  projectIdIdx: index('idx_project_members_project_id').on(table.projectId),
  userIdIdx: index('idx_project_members_user_id').on(table.userId),
}));

// Time entries table - Projects specific (for tracking time spent)
export const timeEntries = pgTable('time_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull(),
  taskId: uuid('task_id'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }), // Better Auth user ID
  description: text('description'),
  hours: numeric('hours', { precision: 10, scale: 2 }).notNull(),
  date: timestamp('date').defaultNow().notNull(),
  billable: boolean('billable').default(false).notNull(),
  hourlyRate: numeric('hourly_rate', { precision: 15, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  projectIdIdx: index('idx_time_entries_project_id').on(table.projectId),
  taskIdIdx: index('idx_time_entries_task_id').on(table.taskId),
  userIdIdx: index('idx_time_entries_user_id').on(table.userId),
  dateIdx: index('idx_time_entries_date').on(table.date),
}));

// Type exports
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type ProjectMember = typeof projectMembers.$inferSelect;
export type NewProjectMember = typeof projectMembers.$inferInsert;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type NewTimeEntry = typeof timeEntries.$inferInsert;
