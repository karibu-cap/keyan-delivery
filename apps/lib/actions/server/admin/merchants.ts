'use server'

import { sendNotificationToUsers } from "@/lib/notifications/push-service";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actionAdminClient, ActionError, requireAdmin } from "./admin-guard";

export async function getMerchants(filters?: {
    search?: string;
    status?: "all" | "verified" | "pending";
    page?: number;
    limit?: number;
}) {
    await requireAdmin();

    const { search, status, page = 1, limit = 20 } = filters || {};
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
        where.OR = [
            { businessName: { contains: search, mode: "insensitive" } },
            { phone: { contains: search } },
        ];
    }

    if (status === "verified") {
        where.isVerified = true;
    } else if (status === "pending") {
        where.isVerified = false;
    }

    const [merchants, total] = await Promise.all([
        prisma.merchant.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: {
                        products: {
                            where: { status: "VERIFIED", visibility: true },
                        },
                        order: true,
                    },
                },
            },
        }),
        prisma.merchant.count({ where }),
    ]);

    return {
        merchants,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getMerchantDetails(merchantId: string) {
    await requireAdmin();

    const merchant = await prisma.merchant.findUnique({
        where: { id: merchantId },
        include: {
            products: {
                include: {
                    images: true,
                },
                orderBy: { createdAt: "desc" },
            },
            order: {
                include: {
                    user: {
                        select: {
                            name: true,
                            phone: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 10,
            },
            managers: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            phone: true,
                        },
                    },
                },
            },
            _count: {
                select: {
                    products: {
                        where: { status: "VERIFIED", visibility: true },
                    },
                    order: true,
                },
            },
        },
    });

    if (!merchant) {
        throw new Error("Merchant not found");
    }

    // Calculate stats
    const activeProducts = merchant._count.products;
    const totalOrders = merchant._count.order;
    const pendingOrders = merchant.order.filter(
        (o) => o.status === "PENDING"
    ).length;

    return {
        merchant,
        stats: {
            activeProducts,
            totalOrders,
            pendingOrders,
        },
    };
}

export const approveMerchant = actionAdminClient
    .inputSchema(z.object({ id: z.string().min(1) }))
    .action(async ({ parsedInput: { id } }) => {
        const activeProductsCount = await prisma.product.count({
            where: { merchantId: id, status: "VERIFIED", visibility: true },
        });
        if (activeProductsCount < 5) {
            throw new ActionError(`Merchant must have at least 5 active products. Currently has ${activeProductsCount}.`);
        }

        await prisma.merchant.update({
            where: { id },
            data: { isVerified: true },
        });

        revalidatePath("/admin/merchants");
        revalidatePath(`/admin/merchants/${id}`);
        return { success: true };
    });

export const rejectMerchant = actionAdminClient
    .inputSchema(z.object({ id: z.string().min(1), reason: z.string().optional() }))
    .action(async ({ parsedInput: { id, reason } }) => {
        await prisma.merchant.update({
            where: { id },
            data: { isVerified: false },
        });

        // TODO: Send notification
        if (reason) console.log("Rejection reason:", reason);
        revalidatePath("/admin/merchants");
        revalidatePath(`/admin/merchants/${id}`);

        return { success: true };
    });

export const senNotificationToMerchant = actionAdminClient
    .inputSchema(z.object({ merchantId: z.string().min(1), message: z.string().min(1) }))
    .action(async ({ parsedInput: { merchantId, message } }) => {

        const managersOfMerchant = await prisma.userMerchantManager.findMany({
            where: { merchantId },
            include: { user: true },
        });

        if (!managersOfMerchant.length) {
            throw new ActionError("Merchant has no managers");
        }

        const result = await sendNotificationToUsers(managersOfMerchant.map(m => m.user.id), { title: 'Admin', body: message });
        console.log("Notification sent to merchant:", managersOfMerchant.map(m => m.user.id), message);

        if (!result.success) {
            throw new ActionError("Failed to send notification to merchant");
        }
        return { success: true };
    });

export const deleteMerchant = actionAdminClient
    .inputSchema(z.object({ id: z.string().min(1) }))
    .action(async ({ parsedInput: { id } }) => {
        // Delete all orders associated with the merchant first
        await prisma.order.deleteMany({
            where: {
                merchantId: id
            },
        });

        // Then delete the merchant
        await prisma.merchant.delete({
            where: { id },
        });
        revalidatePath("/admin/merchants"); return { success: true };
    });

export async function getMerchantOrders(merchantId: string) {
    await requireAdmin();

    const orders = await prisma.order.findMany({
        where: { merchantId },
        include: {
            user: {
                select: {
                    name: true,
                    phone: true,
                    email: true,
                },
            },
            items: {
                include: {
                    product: {
                        select: {
                            title: true,
                            images: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return orders;
}

export async function getMerchantStats(merchantId: string) {
    await requireAdmin();

    const [merchant, orderStats, productStats] = await Promise.all([
        prisma.merchant.findUnique({
            where: { id: merchantId },
            select: {
                businessName: true,
                isVerified: true,
                rating: true,
            },
        }),
        prisma.order.groupBy({
            by: ["status"],
            where: { merchantId },
            _count: true,
        }),
        prisma.product.groupBy({
            by: ["status"],
            where: { merchantId },
            _count: true,
        }),
    ]);

    return {
        merchant,
        orderStats,
        productStats,
    };
}

// Get all merchants for recipient selection
export async function getAllMerchants() {
    await requireAdmin();

    const merchants = await prisma.merchant.findMany({
        select: {
            id: true,
            businessName: true,
            merchantType: true,
            isVerified: true,
            phone: true,
            managers: {
                select: {
                    user: {
                        select: {
                            email: true,
                            name: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            businessName: 'asc',
        },
    });

    return merchants;
}