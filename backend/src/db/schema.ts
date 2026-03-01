import { pgTable, uuid, varchar, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status_enum", [
    "open",
    "in_progress",
    "resolved",
    "closed"
]);
export const priorityEnum = pgEnum("priority_enum", [
    "low",
    "medium",
    "high",
    "critical"
]);

export const tickets = pgTable("tickets", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    status: statusEnum("status").notNull().default("open"),
    priority: priorityEnum("priority"),
    category: varchar("category", { length: 100 }),
    reporterName: varchar("reporter_name", { length: 255 }).notNull(),
    reporterEmail: varchar("reporter_email", { length: 255 }).notNull().unique(),
    reporterId: varchar("reporter_id", {length: 255}),
    assigneeId: varchar("assignee_id", { length: 255 }),
    organizationId: varchar("organization_id", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const ticketComments = pgTable("ticket_comments", {
    id: uuid("id").primaryKey().defaultRandom(),
    ticketId: uuid("ticket_id")
        .references(() => tickets.id, { onDelete: "cascade" })
        .notNull(),
    content: text("content").notNull(),
    authorId: varchar("author_id", { length: 255 }).notNull(),
    isAiGenerated: boolean("is_ai_generated").default(false).notNull(),
    organizationId: varchar("organization_id", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const members = pgTable("member", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    organizationId: varchar("organization_id", { length: 255 }).notNull(),
    role: varchar("role", { length: 50 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// TypeScript types inferred from schema — use these everywhere
export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type Comment = typeof ticketComments.$inferSelect;
export type NewComment = typeof ticketComments.$inferInsert;
export type Member = typeof members.$inferSelect;