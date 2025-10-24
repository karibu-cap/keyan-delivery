import { verifySession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

/**
 * Check if the current user has super_admin role
 * @returns Object with isAdmin boolean and user data if admin
 */
export async function checkIsAdmin() {
    try {
        const token = await verifySession();

        if (!token?.user.id) {
            return { isAdmin: false, user: null };
        }

        const user = await prisma.user.findUnique({
            where: { id: token.user.id: },
            select: {
                id: true,
                id: true,
                email: true,
                name: true,
                roles: true,
            },
        });

        if (!user) {
            return { isAdmin: false, user: null };
        }

        const isAdmin = user.roles.includes(UserRole.super_admin);

        return { isAdmin, user: isAdmin ? user : null };
    } catch (error) {
        console.error("Error checking admin status:", error);
        return { isAdmin: false, user: null };
    }
}

/**
 * Throw error if user is not admin (use in server actions)
 */
export async function requireAdmin() {
    const { isAdmin, user } = await checkIsAdmin();

    if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
    }

    return user;
}