import { sqliteTable, text, integer, index, primaryKey } from "drizzle-orm/sqlite-core";

export const workspace = sqliteTable("workspace", {
  id: text("id").primaryKey(),
  data: text("data").notNull(),
  techs: text("techs").notNull(),
  revision: integer("revision").notNull().default(1),
});

export const studentProfiles = sqliteTable("student_profiles", {
  inviteId: text("invite_id").primaryKey(),
  profile: text("profile").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const studentProgress = sqliteTable("student_progress", {
  id: text("id").primaryKey(),
  inviteId: text("invite_id").notNull(),
  lessonId: text("lesson_id").notNull(),
  answers: text("answers").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const fieldThreads = sqliteTable("field_threads", {
  id: text("id").primaryKey(),
  company: text("company").notNull(),
  trade: text("trade").notNull(),
  techId: text("tech_id").notNull(),
  author: text("author").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull(),
  adminSeenAt: text("admin_seen_at"),
}, (table) => [index("idx_field_threads_company_trade_created").on(table.company, table.trade, table.createdAt), index("idx_field_threads_tech_created").on(table.techId, table.createdAt)]);

export const fieldReplies = sqliteTable("field_replies", {
  id: text("id").primaryKey(),
  threadId: text("thread_id").notNull(),
  authorId: text("author_id").notNull(),
  author: text("author").notNull(),
  role: text("role").notNull(),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [index("idx_field_replies_thread_created").on(table.threadId, table.createdAt)]);

export const policyAcknowledgments = sqliteTable("policy_acknowledgments", {
  inviteId: text("invite_id").notNull(),
  policyId: text("policy_id").notNull(),
  acknowledgedAt: text("acknowledged_at").notNull(),
}, (table) => [primaryKey({columns:[table.inviteId, table.policyId]})]);

export const staffMembers = sqliteTable("staff_members", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  inviteToken: text("invite_token").notNull(),
  expiresAt: text("expires_at").notNull(),
  acceptedAt: text("accepted_at"),
}, (table) => [index("idx_staff_email").on(table.email),index("idx_staff_token").on(table.inviteToken)]);
