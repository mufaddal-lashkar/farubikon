import { Elysia } from "elysia";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { tickets, ticketComments } from "../db/schema";
import { createCommentSchema } from "../schemas/ticket.schemas";
import { authPlugin, requireAuth } from "../middleware/auth";

export const commentRoutes = new Elysia({ prefix: "/tickets" })
    .use(authPlugin)

    // ── GET /tickets/:id/comments ──────────────────────────────────────────
    .get("/:id/comments", async ({ organizationId, userId, session, params }) => {
        if (!requireAuth({ session, organizationId, userId } as any)) return;
        if (!organizationId) return new Response("Organization required", { status: 403 });

        // First verify the ticket belongs to this org
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

        const comments = await db
            .select()
            .from(ticketComments)
            .where(
                and(
                    eq(ticketComments.ticketId, params.id),
                    eq(ticketComments.organizationId, organizationId)  // ← org scope
                )
            );

        return {
            success: true,
            data: comments,
            message: "Fetched ticket comments successfully"
        };
    })

    // ── POST /tickets/:id/comments ─────────────────────────────────────────
    .post("/:id/comments", async ({ organizationId, userId, session, params, body }) => {
        if (!requireAuth({ session, organizationId, userId } as any)) return;
        if (!organizationId) return new Response("Organization required", { status: 403 });

        const parsed = createCommentSchema.safeParse(body);
        if (!parsed.success) {
            return new Response("Body data validation failed", { status: 400 })
        }

        // Verify ticket belongs to this org before allowing comment
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

        if (ticket[0]?.status === "closed") {
            return new Response("Cannot comment on closed ticket", { status: 400 });
        }

        const [newComment] = await db
            .insert(ticketComments)
            .values({
                ticketId: params.id,
                content: parsed.data.content,
                authorId: userId!,
                organizationId: organizationId,  // ← always from session
                isAiGenerated: false,
            })
            .returning();

        return {
            success: true,
            data: newComment,
            message: "Created ticket comment successfully"
        };
    });