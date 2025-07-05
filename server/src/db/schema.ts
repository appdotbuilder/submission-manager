
import { serial, text, pgTable, timestamp } from 'drizzle-orm/pg-core';

export const submissionsTable = pgTable('submissions', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// TypeScript type for the table schema
export type Submission = typeof submissionsTable.$inferSelect; // For SELECT operations
export type NewSubmission = typeof submissionsTable.$inferInsert; // For INSERT operations

// Important: Export all tables and relations for proper query building
export const tables = { submissions: submissionsTable };
