import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./admin-guard";

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

export async function approveMerchant(merchantId: string) {
    await requireAdmin();

    // Check if merchant has at least 5 active products
    const activeProductsCount = await prisma.product.count({
        where: {
            merchantId,
            status: "VERIFIED",
            visibility: true,
        },
    });

    if (activeProductsCount < 5) {
        return {
            success: false,
            error: `Merchant must have at least 5 active products. Currently has ${activeProductsCount}.`,
        };
    }

    await prisma.merchant.update({
        where: { id: merchantId },
        data: { isVerified: true },
    });

    revalidatePath("/admin/merchants");
    revalidatePath(`/admin/merchants/${merchantId}`);

    return { success: true };
}

export async function rejectMerchant(merchantId: string, reason?: string) {
    await requireAdmin();

    await prisma.merchant.update({
        where: { id: merchantId },
        data: { isVerified: false },
    });

    // TODO: Send notification to merchant with rejection reason

    revalidatePath("/admin/merchants");
    revalidatePath(`/admin/merchants/${merchantId}`);

    return { success: true };
}

export async function deleteMerchant(merchantId: string) {
    await requireAdmin();

    await prisma.merchant.delete({
        where: { id: merchantId },
    });

    revalidatePath("/admin/merchants");

    return { success: true };
}

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