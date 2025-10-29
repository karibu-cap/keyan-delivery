
"use server";

import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import z from "zod";
import { actionAdminClient, ActionError, requireAdmin } from "./admin-guard";

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
            merchant: true,
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

export const deleteProduct = actionAdminClient
    .inputSchema(z.object({ productId: z.string().min(1) }))
    .action(async ({ parsedInput: { productId } }) => {

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
            throw new ActionError(`Cannot delete product that is in ${activeOrders} active order(s)`);
        }

        await prisma.product.delete({
            where: { id: productId },
        });

        revalidatePath("/admin/products");

        return { success: true };
    })

export const bulkProducts = actionAdminClient
    .inputSchema(z.object({ productIds: z.array(z.string()), action: z.enum(['approve', 'reject']) }))
    .action(async ({ parsedInput: { productIds, action } }) => {

        if (action === 'approve') {
            await prisma.product.updateMany({
                where: { id: { in: productIds } },
                data: {
                    status: ProductStatus.VERIFIED,
                    visibility: true,
                },
            });
        }

        if (action === 'reject') {
            await prisma.product.updateMany({
                where: { id: { in: productIds } },
                data: {
                    status: ProductStatus.REJECTED,
                    visibility: false,
                },
            });
        }


        revalidatePath("/admin/products");

        return {
            success: true,
            total: productIds.length,
        };

    })

export const updateProduct = actionAdminClient
    .inputSchema(z.object({ productId: z.string().min(1), action: z.enum(['approve', 'reject', 'toggleVisibility']) }))
    .action(async ({ parsedInput: { productId, action } }) => {

        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: {
                title: true,
                images: true,
                price: true,
                merchantId: true,
                visibility: true
            },
        });

        if (!product) {
            throw new ActionError("Product not found");
        }

        if (action === 'reject') {
            await prisma.product.update({
                where: { id: productId },
                data: {
                    status: ProductStatus.REJECTED,
                    visibility: false,
                },
            });
            revalidatePath(`/admin/products/${productId}`);
            revalidatePath("/admin/merchants");
            return {
                success: true,
            };
        }

        // Validation checks
        if (!product.title || product.title.length < 3) {
            throw new ActionError("Product must have a valid title (at least 3 characters)");
        }

        if (product.images.length === 0) {
            throw new ActionError("Product must have at least one image");
        }

        if (!product.price || product.price <= 0) {
            throw new ActionError("Product must have a valid price");
        }

        if (action === 'toggleVisibility') {
            await prisma.product.update({
                where: { id: productId },
                data: { visibility: !product.visibility },
            });
        }

        // Check if merchant now has 5+ active products for auto-verification
        if (action === 'approve') {
            await prisma.product.update({
                where: { id: productId },
                data: { status: ProductStatus.VERIFIED, visibility: true },
            });
        }


        revalidatePath("/admin/products");
        revalidatePath(`/admin/products/${productId}`);

        return { success: true };
    });
