import { z } from "zod";

export const ticketStatusEnum = z.enum([
    "open",
    "in_progress",
    "resolved",
    "closed",
]);
export const ticketPriorityEnum = z.enum([
    "low",
    "medium",
    "high",
    "critical",
]);
export const commentToneEnum = z.enum([
    "professional",
    "friendly",
    "formal",
]);

// ── Ticket Schemas ─────────────────────────────────────────────────────────
export const createTicketSchema = z.object({
    title: z
        .string()
        .min(5, "Title must be at least 5 characters")
        .max(255, "Title must be at most 255 characters"),
    description: z
        .string()
        .min(10, "Description must be at least 10 characters"),
    reporterName: z
        .string()
        .optional(),
    reporterEmail: z
        .string()
        .email("Reporter email must be a valid email address")
        .optional(),
    status: ticketStatusEnum.default("open"),
});

export const updateTicketSchema = createTicketSchema.partial();

export const updateStatusSchema = z.object({
    status: ticketStatusEnum,
});

export const assignTicketSchema = z.object({
    assigneeId: z
        .string()
        .min(1, "Assignee ID must not be empty"),
});

// ── Comment Schemas ────────────────────────────────────────────────────────
export const createCommentSchema = z.object({
    content: z
        .string()
        .min(1, "Comment content is required")
        .max(5000, "Comment must be at most 5000 characters"),
});

// ── Query Parameter Schemas ────────────────────────────────────────────────
export const ticketQuerySchema = z.object({
    status: ticketStatusEnum.optional(),
    priority: ticketPriorityEnum.optional(),
    category: z.string().optional(),
    search: z.string().optional(),
    page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1))
        .pipe(z.number().min(1, "Page must be at least 1")),
    limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 20))
        .pipe(z.number().min(1).max(100, "Limit must be at most 100")),
});

// ── Inferred Types ─────────────────────────────────────────────────────────
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type TicketQuery = z.infer<typeof ticketQuerySchema>;