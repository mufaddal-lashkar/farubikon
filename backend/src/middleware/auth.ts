import { Elysia } from "elysia";
import { auth } from "../auth";
import { db } from "../db"

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
            const membership = await db.query.members.findFirst({
                where: (m, { and, eq }) =>
                    and(
                        eq(m.userId, userId),
                        eq(m.organizationId, orgId)
                    ),
            });

            role = membership?.role as UserRole ?? null;
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
    // error: (status: number, message: string) => void
): boolean => {
    if (userRole !== "admin") {
        // error(403, "Forbidden: admin access required");
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
        // throw new Error("Forbidden: you do not have permission to modify this resource");
        return false;
    }
    return true;
};