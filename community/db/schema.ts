import { sql } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const anonymousParticipants = sqliteTable("anonymous_participants", {
  id: text("id").primaryKey(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  lastSeenAt: text("last_seen_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  displayName: text("display_name"),
  email: text("email"),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const suggestions = sqliteTable("suggestions", {
  id: text("id").primaryKey(),
  authorUserId: text("author_user_id").references(() => profiles.id),
  anonymousAuthorId: text("anonymous_author_id").references(() => anonymousParticipants.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  categoryId: text("category_id").notNull().references(() => categories.id),
  status: text("status", { enum: ["New", "Under review", "Planned", "In progress", "Shipped", "Not planned"] }).notNull().default("New"),
  developerResponse: text("developer_response"),
  internalNotes: text("internal_notes"),
  canonicalSuggestionId: text("canonical_suggestion_id"),
  isHidden: integer("is_hidden", { mode: "boolean" }).notNull().default(false),
  isPinned: integer("is_pinned", { mode: "boolean" }).notNull().default(false),
  commentsLocked: integer("comments_locked", { mode: "boolean" }).notNull().default(false),
  shippedVersion: text("shipped_version"),
  shippedAt: text("shipped_at"),
  premiumRequirement: text("premium_requirement"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const votes = sqliteTable("votes", {
  suggestionId: text("suggestion_id").notNull().references(() => suggestions.id),
  userId: text("user_id").references(() => profiles.id),
  anonymousParticipantId: text("anonymous_participant_id").references(() => anonymousParticipants.id),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({ voteIdentity: uniqueIndex("votes_suggestion_user_idx").on(table.suggestionId, table.userId, table.anonymousParticipantId) }));

export const follows = sqliteTable("follows", {
  suggestionId: text("suggestion_id").notNull().references(() => suggestions.id),
  userId: text("user_id").notNull().references(() => profiles.id),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({ followKey: primaryKey({ columns: [table.suggestionId, table.userId] }) }));

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  suggestionId: text("suggestion_id").notNull().references(() => suggestions.id),
  userId: text("user_id").notNull().references(() => profiles.id),
  body: text("body").notNull(),
  isHidden: integer("is_hidden", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const suggestionStatusHistory = sqliteTable("suggestion_status_history", {
  id: text("id").primaryKey(),
  suggestionId: text("suggestion_id").notNull().references(() => suggestions.id),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  changedBy: text("changed_by").notNull(),
  note: text("note"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(),
  suggestionId: text("suggestion_id").references(() => suggestions.id),
  commentId: text("comment_id").references(() => comments.id),
  reason: text("reason").notNull(),
  reporterUserId: text("reporter_user_id").references(() => profiles.id),
  status: text("status", { enum: ["open", "reviewed", "dismissed"] }).notNull().default("open"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
