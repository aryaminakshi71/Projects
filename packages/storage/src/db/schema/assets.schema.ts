import { pgTable, uuid, varchar, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const assets = pgTable('assets', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    url: text('url').notNull(),
    // Using jsonb for tags array since it's flexible, though text[] is also an option in Postgres
    tags: jsonb('tags').$type<string[]>().default([]).notNull(),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('idx_assets_user_id').on(table.userId),
}));

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
