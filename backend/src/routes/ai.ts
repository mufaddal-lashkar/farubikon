import { Elysia } from "elysia";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { tickets, ticketComments } from "../db/schema";
import { authPlugin, requireAuth } from "../middleware/auth";
import { classifyTicket, streamSuggestedResponse } from "../services/ai.service";

export const aiRoutes = new Elysia({ prefix: "/tickets" })
    .use(authPlugin)

    // ── POST /tickets/:id/classify ─────────────────────────────────────────
    .post("/:id/classify", async ({ organizationId, userId, session, params }) => {
        if (!requireAuth({ session, organizationId, userId } as any)) return;
        if (!organizationId) return new Response("Organization required", { status: 403 });

        // Fetch ticket — scoped to org
        const ticketResult = await db
            .select()
            .from(tickets)
            .where(
                and(
                    eq(tickets.id, params.id),
                    eq(tickets.organizationId, organizationId)
                )
            )
            .limit(1);

        if (ticketResult.length === 0) {
            return new Response("Ticket not found", { status: 404 })
        }

        const ticket = ticketResult[0]!;

        // Call AI service — if it's down, return clean error (don't crash)
        let classification;
        try {
            classification = await classifyTicket(ticket.title, ticket.description);
        } catch (err) {
            console.error("[AI classify error]", err);
            return new Response("AI service is unavailable. Please try again later.", { status: 502 })
        }

        // Update ticket with AI classification — org scoped
        const [updated] = await db
            .update(tickets)
            .set({
                priority: classification.priority,
                category: classification.category,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(tickets.id, params.id),
                    eq(tickets.organizationId, organizationId)
                )
            )
            .returning();

        return {
            success: true,
            data: {
                ticket: updated,
                classification: classification
            },
            message: "Ticket classified successfully"
        };
    })

    // ── GET /tickets/:id/suggest-response ──────────────────────────────────
    // ⚠️ This is the SSE proxy — hand-write this carefully
    .get("/:id/suggest-response", async ({ organizationId, userId, session, params, query, set }) => {
        if (!requireAuth({ session, organizationId, userId } as any)) return;
        if (!organizationId) return new Response("Organization required", { status: 403 });

        // Fetch ticket — scoped to org
        const ticketResult = await db
            .select()
            .from(tickets)
            .where(
                and(
                    eq(tickets.id, params.id),
                    eq(tickets.organizationId, organizationId)
                )
            )
            .limit(1);

        if (ticketResult.length === 0) {
            return new Response("Ticket not found", { status: 404 })
        }

        const ticket = ticketResult[0]!;

        // Fetch existing comments for context — scoped to org
        const comments = await db
            .select()
            .from(ticketComments)
            .where(
                and(
                    eq(ticketComments.ticketId, params.id),
                    eq(ticketComments.organizationId, organizationId)
                )
            );

        const tone = (query.tone as "professional" | "friendly" | "formal") ?? "professional";

        // Set SSE headers
        set.headers["Content-Type"] = "text/event-stream";
        set.headers["Cache-Control"] = "no-cache";
        set.headers["Connection"] = "keep-alive";

        // Call AI service and get the stream back
        let aiResponse: Response;
        try {
            aiResponse = await streamSuggestedResponse({
                ticket_title: ticket.title,
                ticket_description: ticket.description,
                ticket_category: ticket.category ?? null,
                ticket_priority: ticket.priority ?? null,
                existing_comments: comments.map((c) => ({
                    content: c.content,
                    author_id: c.authorId,
                    is_ai_generated: c.isAiGenerated,
                })),
                tone,
            });
        } catch (err) {
            console.error("[AI suggest-response error]", err);
            // Return an SSE error chunk so the frontend can handle it gracefully
            return new Response(
                `data: ${JSON.stringify({ content: "", done: true, error: "AI service is unavailable" })}\n\n`,
                {
                    headers: {
                        "Content-Type": "text/event-stream",
                        "Cache-Control": "no-cache",
                        "Connection": "keep-alive",
                    }
                }
            );
        }

        // Forward the SSE stream from AI service to the frontend
        // The AI service already formats chunks correctly — we pass them through
        return new Response(aiResponse.body, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    });