'use server';

import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import z from 'zod';
import { actionAdminClient, ActionError, requireAdmin } from './admin-guard';

// Get all users with filtering
export async function getAllUsers(filters?: {
    search?: string;
    role?: UserRole | 'all';
    driverStatus?: string;
}) {
    await requireAdmin();

    const where: any = {};

    // Search filter
    if (filters?.search) {
        where.OR = [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } },
            { phone: { contains: filters.search, mode: 'insensitive' } },
        ];
    }

    // Role filter
    if (filters?.role && filters.role !== 'all') {
        where.roles = { has: filters.role };
    }

    // Driver status filter
    if (filters?.driverStatus && filters.driverStatus !== 'all') {
        where.driverStatus = filters.driverStatus;
    }

    const users = await prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            roles: true,
            driverStatus: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: {
                    orders: true,
                },
            },
        },
    });

    return users;
}

// Get user by ID
export async function getUserById(userId: string) {
    await requireAdmin();

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            orders: {
                take: 5,
                orderBy: { createdAt: 'desc' },
            },
            _count: {
                select: {
                    orders: true,
                },
            },
        },
    });

    return user;
}


// Get user statistics
export async function getUserStats() {
    await requireAdmin();

    const [
        totalUsers,
        customerCount,
        merchantCount,
        driverCount,
        adminCount,
        verifiedCount,
        pendingDrivers,
        approvedDrivers,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { roles: { has: UserRole.customer } } }),
        prisma.user.count({ where: { roles: { has: UserRole.merchant } } }),
        prisma.user.count({ where: { roles: { has: UserRole.driver } } }),
        prisma.user.count({ where: { roles: { has: UserRole.super_admin } } }),
        prisma.user.count({ where: { emailVerified: true } }),
        prisma.user.count({ where: { driverStatus: 'PENDING' } }),
        prisma.user.count({ where: { driverStatus: 'APPROVED' } }),
    ]);

    return {
        totalUsers,
        customerCount,
        merchantCount,
        driverCount,
        adminCount,
        verifiedCount,
        pendingDrivers,
        approvedDrivers,
    };
}


// Update user roles
export const updateUserRole = actionAdminClient.inputSchema(z.object({ userId: z.string().min(1), role: z.enum(UserRole), action: z.enum(['add', 'remove']) }))
    .action(async ({ parsedInput: { userId, role, action } }) => {

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { roles: true, email: true },
        });

        if (!user) {
            throw new ActionError('User not found');
        }

        // Prevent removing super_admin from the last super_admin
        if (action === 'remove' && role === UserRole.super_admin) {
            const adminCount = await prisma.user.count({
                where: {
                    roles: { has: UserRole.super_admin },
                },
            });

            if (adminCount <= 1) {
                throw new ActionError('Cannot remove the last super admin');
            }
        }

        let updatedRoles: UserRole[];

        if (action === 'add') {
            // Add role if not already present
            if (user.roles.includes(role)) {
                throw new ActionError(`User already has the ${role} role`);
            }
            updatedRoles = [...user.roles, role];
        } else {
            // Remove role
            if (!user.roles.includes(role)) {
                throw new ActionError(`User does not have the ${role} role`);
            }
            updatedRoles = user.roles.filter((r) => r !== role);
        }

        await prisma.user.update({
            where: { id: userId },
            data: { roles: updatedRoles },
        });

        revalidatePath('/admin/users');
        revalidatePath(`/admin/users/${userId}`);

        return { success: true };
    });

// Delete user
export const deleteUser = actionAdminClient.inputSchema(z.object({ userId: z.string().min(1) }))
    .action(async ({ parsedInput: { userId } }) => {
        const admin = await requireAdmin();

        // Prevent self-deletion
        if (admin.id === userId) {
            throw new ActionError('Cannot delete your own account');
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                roles: true,
                _count: {
                    select: {
                        orders: true,
                    },
                },
            },
        });

        if (!user) {
            throw new ActionError('User not found');
        }

        // Prevent deleting the last super_admin
        if (user.roles.includes(UserRole.super_admin)) {
            const adminCount = await prisma.user.count({
                where: {
                    roles: { has: UserRole.super_admin },
                },
            });

            if (adminCount <= 1) {
                throw new ActionError('Cannot delete the last super admin');
            }
        }

        // Check if user has orders
        if (user._count.orders > 0) {
            throw new ActionError(
                `Cannot delete user with ${user._count.orders} orders. Consider deactivating the account instead.`
            );
        }

        await prisma.$transaction([
            // Delete related data first
            prisma.wishlist.deleteMany({ where: { userId } }),
            prisma.cartItem.deleteMany({ where: { userId } }),
            prisma.savedList.deleteMany({ where: { userId } }),
            prisma.pushSubscription.deleteMany({ where: { userId } }),
            prisma.verification.deleteMany({ where: { userId } }),
            prisma.session.deleteMany({ where: { userId } }),
            prisma.account.deleteMany({ where: { userId } }),
            // Finally delete the user
            prisma.user.delete({ where: { id: userId } }),
        ]);

        revalidatePath('/admin/users');

        return { success: true };
    });