
"use server";

import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./admin-guard";

export async function getProducts(filters?: {
    search?: string;
    status?: "all" | "verified" | "waiting_for_review" | "rejected" | "draft";
    merchantId?: string;
    page?: number;
    limit?: number;
}) {
    await requireAdmin();

    const { search, status, merchantId, page = 1, limit = 20 } = filters || {};
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { merchant: { businessName: { contains: search, mode: "insensitive" } } },
        ];
    }

    if (status && status !== "all") {
        where.status = status.toUpperCase();
    }

    if (merchantId) {
        where.merchantId = merchantId;
    }

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                merchant: {
                    select: {
                        id: true,
                        businessName: true,
                        isVerified: true,
                    },
                },
                images: true,
                categories: {
                    include: {
                        category: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        }),
        prisma.product.count({ where }),
    ]);

    return {
        products,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getProductDetails(productId: string) {
    await requireAdmin();

    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
            merchant: {
                select: {
                    id: true,
                    businessName: true,
                    phone: true,
                    isVerified: true,
                    logoUrl: true,
                },
            },
            images: true,
            categories: {
                include: {
                    category: true,
                },
            },
            promotions: true,
        },
    });

    if (!product) {
        throw new Error("Product not found");
    }

    return { product };
}

export async function approveProduct(productId: string) {
    await requireAdmin();

    const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
            title: true,
            images: true,
            price: true,
            merchantId: true,
        },
    });

    if (!product) {
        return {
            success: false,
            error: "Product not found",
        };
    }

    // Validation checks
    if (!product.title || product.title.length < 3) {
        return {
            success: false,
            error: "Product must have a valid title (at least 3 characters)",
        };
    }

    if (product.images.length === 0) {
        return {
            success: false,
            error: "Product must have at least one image",
        };
    }

    if (!product.price || product.price <= 0) {
        return {
            success: false,
            error: "Product must have a valid price",
        };
    }

    await prisma.product.update({
        where: { id: productId },
        data: {
            status: ProductStatus.VERIFIED,
            visibility: true,
        },
    });

    // Check if merchant now has 5+ active products for auto-verification
    const activeProductsCount = await prisma.product.count({
        where: {
            merchantId: product.merchantId,
            status: ProductStatus.VERIFIED,
            visibility: true,
        },
    });

    if (activeProductsCount >= 5) {
        await prisma.merchant.update({
            where: { id: product.merchantId },
            data: { isVerified: true },
        });
    }

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/admin/merchants");

    return { success: true };
}

export async function rejectProduct(productId: string, reason?: string) {
    await requireAdmin();

    await prisma.product.update({
        where: { id: productId },
        data: {
            status: ProductStatus.REJECTED,
            visibility: false,
        },
    });

    // TODO: Send rejection notification to merchant with reason

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);

    return { success: true };
}

export async function deleteProduct(productId: string) {
    await requireAdmin();

    // Check if product is in any active orders
    const activeOrders = await prisma.orderItem.count({
        where: {
            productId,
            order: {
                status: {
                    in: [
                        "PENDING",
                        "ACCEPTED_BY_MERCHANT",
                        "ACCEPTED_BY_DRIVER",
                        "IN_PREPARATION",
                        "READY_TO_DELIVER",
                        "ON_THE_WAY",
                    ],
                },
            },
        },
    });

    if (activeOrders > 0) {
        return {
            success: false,
            error: `Cannot delete product that is in ${activeOrders} active order(s)`,
        };
    }

    await prisma.product.delete({
        where: { id: productId },
    });

    revalidatePath("/admin/products");

    return { success: true };
}

export async function toggleProductVisibility(productId: string) {
    await requireAdmin();

    const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { visibility: true },
    });

    if (!product) {
        return {
            success: false,
            error: "Product not found",
        };
    }

    await prisma.product.update({
        where: { id: productId },
        data: { visibility: !product.visibility },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);

    return { success: true };
}

export async function bulkApproveProducts(productIds: string[]) {
    await requireAdmin();

    const results = await Promise.allSettled(
        productIds.map((id) => approveProduct(id))
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    revalidatePath("/admin/products");

    return {
        success: true,
        successful,
        failed,
        total: productIds.length,
    };
}

export async function bulkRejectProducts(productIds: string[]) {
    await requireAdmin();

    await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: {
            status: ProductStatus.REJECTED,
            visibility: false,
        },
    });

    revalidatePath("/admin/products");

    return {
        success: true,
        total: productIds.length,
    };
}