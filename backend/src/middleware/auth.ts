import { Elysia } from "elysia";
import { auth } from "../auth";
import { db } from "../db"
import { member } from "../db/schema";
import { eq, and } from "drizzle-orm";

export type UserRole = "admin" | "member";

// This runs on every request and attaches session + org info to the context
export const authPlugin = new Elysia({ name: "auth-plugin" })
    .derive({ as: "global" }, async ({ request }) => {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        const orgId = session?.session?.activeOrganizationId;
        const userId = session?.user?.id;

        let role: UserRole | null = null;

        if (orgId && userId) {
            const membership = await db
                .select()
                .from(member)
                .where(
                    and(
                        eq(member.userId, userId),
                        eq(member.organizationId, orgId)
                    )
                )
                .limit(1);

            role = (membership[0]?.role as UserRole) ?? null;
        }

        return {
            session: session ?? null,
            userId: userId ?? null,
            organizationId: orgId ?? null,
            userRole: role,
        };
    });


// Use this on any route that requires a logged-in user with an active org
export const requireAuth = (ctx: {
    session: unknown;
    organizationId: string | null;
    userId: string | null;
    set: { status: number };
    error: (status: number, message: string) => void;
}) => {
    if (!ctx.session || !ctx.userId) {
        ctx.error(401, "Unauthorized: you must be logged in");
        return false;
    }

    if (!ctx.organizationId) {
        ctx.error(403, "Forbidden: no active organization on session");
        return false;
    }

    return true;
};

// Call these inside route handlers after requireAuth passes
export const requireAdmin = (
    userRole: UserRole | null,
): boolean => {
    if (userRole !== "admin") {
        return false;
    }
    return true;
};

export const requireOwnerOrAdmin = (
    resourceOwnerId: string,
    userId: string,
    userRole: UserRole | null,
): boolean => {
    const isOwner = resourceOwnerId === userId;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
        return false;
    }
    return true;
};