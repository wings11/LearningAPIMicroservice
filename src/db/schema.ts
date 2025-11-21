import { relations } from 'drizzle-orm';
import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const lessons = pgTable('lessons', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  price: integer('price').notNull().default(0),
  status: text('status').notNull().default('draft'),
  isPublished: boolean('is_published').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const lessonPurchases = pgTable('lesson_purchases', {
  id: uuid('id').defaultRandom().primaryKey(),
  lessonId: uuid('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').notNull(),
  pricePaid: integer('price_paid').notNull(),
  reference: text('reference'),
  metadata: jsonb('metadata').$type<Record<string, unknown> | null>().default(null),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  prefix: text('prefix').notNull(),
  hashedKey: text('hashed_key').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
});

export const lessonRelations = relations(lessons, ({ many }) => ({
  purchases: many(lessonPurchases),
}));

export const lessonPurchaseRelations = relations(lessonPurchases, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonPurchases.lessonId],
    references: [lessons.id],
  }),
}));
