import { Elysia } from "elysia";
import { eq, and, ilike, SQL, sql } from "drizzle-orm";
import { db } from "../db";
import { tickets, users } from "../db/schema";
import {
    createTicketSchema,
    updateTicketSchema,
    updateStatusSchema,
    assignTicketSchema,
    ticketQuerySchema,
} from "../schemas/ticket.schemas";
import {
    authPlugin,
    requireAuth,
    requireAdmin,
    requireOwnerOrAdmin,
} from "../middleware/auth";

export const ticketRoutes = new Elysia({ prefix: "/tickets" })
    .use(authPlugin)

    // ── GET /tickets ───────────────────────────────────────────────────────
    .get("/", async ({ organizationId, userId, session, query }) => {
        if (!requireAuth({ session, organizationId, userId } as any)) return;
        if (!organizationId) return new Response("Organization required", { status: 403 });

        // Validate + coerce query params
        const parsed = ticketQuerySchema.safeParse(query);
        if (!parsed.success) {
            return new Response("Query validation failed", { status: 400 });
        }

        const { status, priority, category, search, page, limit } = parsed.data;

        // Build filters
        const filters: SQL[] = [eq(tickets.organizationId, organizationId!)];

        if (status) filters.push(eq(tickets.status, status));
        if (priority) filters.push(eq(tickets.priority, priority));
        if (category) filters.push(eq(tickets.category, category));
        if (search) filters.push(ilike(tickets.title, `%${search}%`));

        const offset = (page - 1) * limit;

        const results = await db
            .select()
            .from(tickets)
            .where(and(...filters))
            .limit(limit)
            .offset(offset);

        const totalResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(tickets)
            .where(and(...filters));

        const total = totalResult[0]?.count ?? 0;

        return {
            success: true,
            data: results,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            message: "Fetched all tickets successfully"
        };
    })

    // ── GET /tickets/:id ───────────────────────────────────────────────────
    .get("/:id", async ({ organizationId, userId, session, params }) => {
        if (!requireAuth({ session, organizationId, userId } as any)) return;
        if (!organizationId) return new Response("Organization required", { status: 403 });

        const ticket = await db
            .select()
            .from(tickets)
            .where(
                and(
                    eq(tickets.id, params.id),
                    eq(tickets.organizationId, organizationId)
                )
            )
            .limit(1);

        if (ticket.length === 0) {
            return new Response("Ticket not found", { status: 404 })
        }

        return {
            success: true,
            data: ticket[0],
            message: "Fetched ticket successfully"
        }
    })

    // ── POST /tickets ──────────────────────────────────────────────────────
    .post("/", async ({ organizationId, userId, session, body }) => {
        if (!requireAuth({ session, organizationId, userId } as any)) return;
        if (!organizationId) return new Response("Organization required", { status: 403 });

        const parsed = createTicketSchema.safeParse(body);
        if (!parsed.success) {
            return new Response("Body data validation failed", { status: 400 })
        }

        // If reporterName/Email are not provided, fetch them from the user's account
        let { reporterName, reporterEmail } = parsed.data;

        if (!reporterName || !reporterEmail) {
            const userResult = await db
                .select()
                .from(users)
                .where(eq(users.id, userId!))
                .limit(1);

            if (userResult.length > 0) {
                reporterName = reporterName || userResult[0]!.name;
                reporterEmail = reporterEmail || userResult[0]!.email;
            }
        }

        if (!reporterName || !reporterEmail) {
            return new Response("Could not determine reporter info", { status: 400 });
        }

        const [newTicket] = await db
            .insert(tickets)
            .values({
                ...parsed.data,
                reporterName,
                reporterEmail,
                reporterId: userId,
                organizationId: organizationId,
            })
            .returning();

        return {
            success: true,
            data: newTicket,
            message: "Created ticket successfully"
        };
    })

    // ── PUT /tickets/:id ───────────────────────────────────────────────────
    .put("/:id", async ({ organizationId, userId, userRole, session, params, body }) => {
        if (!requireAuth({ session, organizationId, userId } as any)) return;
        if (!organizationId) return new Response("Organization required", { status: 403 });

        const parsed = updateTicketSchema.safeParse(body);
        if (!parsed.success) {
            return new Response("Body data validation failed", { status: 400 })
        }

        // Fetch ticket first — with org scope
        const existing = await db
            .select()
            .from(tickets)
            .where(
                and(
                    eq(tickets.id, params.id),
                    eq(tickets.organizationId, organizationId)
                )
            )
            .limit(1);

        if (existing.length === 0) {
            return new Response("Ticket not found", { status: 404 })
        }
        const ticket = existing[0]
        if (!ticket?.reporterId) {
            return new Response("Invalid ticket reporter", { status: 400 });
        }


        // RBAC: only owner or admin can update
        if (!requireOwnerOrAdmin(ticket.reporterId, userId!, userRole)) return;

        const [updated] = await db
            .update(tickets)
            .set({ ...parsed.data, updatedAt: new Date() })
            .where(
                and(
                    eq(tickets.id, params.id),
                    eq(tickets.organizationId, organizationId)
                )
            )
            .returning();

        return {
            success: true,
            data: updated,
            message: "Updated ticket successfully"
        };
    })

    // ── DELETE /tickets/:id ────────────────────────────────────────────────
    .delete("/:id", async ({ organizationId, userId, userRole, session, params }) => {
        if (!requireAuth({ session, organizationId, userId } as any)) return;
        if (!organizationId) return new Response("Organization required", { status: 403 });

        // RBAC: owner or admin
        const existing = await db
            .select()
            .from(tickets)
            .where(
                and(
                    eq(tickets.id, params.id),
                    eq(tickets.organizationId, organizationId)
                )
            )
            .limit(1);

        if (existing.length === 0) {
            return new Response("Ticket not found", { status: 404 })
        }

        const ticket = existing[0]
        if (!ticket?.reporterId) {
            return new Response("Invalid ticket reporter", { status: 400 });
        }

        if (!requireOwnerOrAdmin(ticket.reporterId, userId!, userRole)) return;

        await db
            .delete(tickets)
            .where(
                and(
                    eq(tickets.id, params.id),
                    eq(tickets.organizationId, organizationId)
                )
            );

        return {
            success: true,
            message: "Deleted ticket successfully"
        };
    })

    // ── PATCH /tickets/:id/status ──────────────────────────────────────────
    .patch("/:id/status", async ({ organizationId, userId, userRole, session, params, body }) => {
        if (!requireAuth({ session, organizationId, userId } as any)) return;
        if (!organizationId) return new Response("Organization required", { status: 403 });

        const parsed = updateStatusSchema.safeParse(body);
        if (!parsed.success) {
            return new Response("Body data validation failed", { status: 400 })
        }

        const existing = await db
            .select()
            .from(tickets)
            .where(
                and(
                    eq(tickets.id, params.id),
                    eq(tickets.organizationId, organizationId)
                )
            )
            .limit(1);

        if (existing.length === 0) {
            return new Response("Ticket not found", { status: 404 })
        }

        const ticket = existing[0]
        if (!ticket?.reporterId) {
            return new Response("Invalid ticket reporter", { status: 400 });
        }

        if (!requireOwnerOrAdmin(ticket.reporterId, userId!, userRole)) return;

        const [updated] = await db
            .update(tickets)
            .set({ status: parsed.data.status, updatedAt: new Date() })
            .where(
                and(
                    eq(tickets.id, params.id),
                    eq(tickets.organizationId, organizationId)
                )
            )
            .returning();

        return {
            success: true,
            data: updated,
            message: "Updated ticket status successfully"
        };
    })

    // ── PATCH /tickets/:id/assign ──────────────────────────────────────────
    .patch("/:id/assign", async ({ organizationId, userId, userRole, session, params, body }) => {
        if (!requireAuth({ session, organizationId, userId } as any)) return;
        if (!organizationId) return new Response("Organization required", { status: 403 });

        // RBAC: admin only
        if (!requireAdmin(userRole)) return;

        const parsed = assignTicketSchema.safeParse(body);
        if (!parsed.success) {
            return new Response("Body data validation failed", { status: 400 })
        }

        const existing = await db
            .select()
            .from(tickets)
            .where(
                and(
                    eq(tickets.id, params.id),
                    eq(tickets.organizationId, organizationId)
                )
            )
            .limit(1);

        if (existing.length === 0) {
            return new Response("Ticket not found", { status: 404 })
        }

        const [updated] = await db
            .update(tickets)
            .set({ assigneeId: parsed.data.assigneeId, updatedAt: new Date() })
            .where(
                and(
                    eq(tickets.id, params.id),
                    eq(tickets.organizationId, organizationId)
                )
            )
            .returning();

        return {
            success: true,
            data: updated,
            message: "Updated ticket assignee successfully"
        };
    });