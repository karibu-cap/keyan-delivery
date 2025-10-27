// admin-guard.ts (updated)

import { verifySession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import {
    createSafeActionClient,
    DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";

export class ActionError extends Error { }

/**
 * Admin-only action client with typed context
 */
export const actionAdminClient = createSafeActionClient({
    handleServerError(e) {
        console.error("Action error:", e);

        if (e instanceof ActionError) {
            return e.message;
        }

        return DEFAULT_SERVER_ERROR_MESSAGE;
    }

}).use(async ({ next }) => {
    const { isAdmin, user } = await checkIsAdmin();

    if (!isAdmin || !user) {
        throw new ActionError("Unauthorized: Admin access required");
    }

    return next({
        ctx: {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                roles: user.roles,
            },
        },
    });
});

// Reusable admin check (for non-action server functions)
export async function requireAdmin() {
    const { isAdmin, user } = await checkIsAdmin();
    if (!isAdmin || !user) { throw new Error("Unauthorized: Admin access required"); }
    return user;
}

export async function checkIsAdmin() {
    try {
        const token = await verifySession();
        if (!token?.user?.id) return { isAdmin: false, user: null };

        const user = await prisma.user.findUnique({
            where: { id: token.user.id },
            select: { id: true, roles: true, email: true, name: true, image: true },
        });

        if (!user) return { isAdmin: false, user: null };

        const isAdmin = user.roles.includes(UserRole.super_admin) || user.email.endsWith("@karibu-cap.com");
        return { isAdmin, user: isAdmin ? user : null };
    } catch (error) {
        console.error("Error checking admin status:", error);
        return { isAdmin: false, user: null };
    }
}