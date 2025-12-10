import { verifySession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import {
    createSafeActionClient,
    DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";

export class ActionError extends Error { }

/**
 * Admin-only action client with typed context
 */
export const actionUserClient = createSafeActionClient({
    handleServerError(e) {
        console.error("Action error:", e);

        if (e instanceof ActionError) {
            return e.message;
        }

        return DEFAULT_SERVER_ERROR_MESSAGE;
    }

}).use(async ({ next }) => {
    const { user } = await checkIsUser();

    if (!user) {
        throw new ActionError("Unauthorized: user access required");
    }

    return next({
        ctx: {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        },
    });
});

export async function checkIsUser() {
    try {
        const token = await verifySession();
        if (!token?.user?.id) return { isAdmin: false, user: null };

        const user = await prisma.user.findUnique({
            where: { id: token.user.id },
            select: { id: true, roles: true, email: true, name: true, image: true },
        });

        if (!user) return { isAdmin: false, user: null };

        return { user: user };
    } catch (error) {
        console.error("Error checking status:", error);
        return { user: null };
    }
}