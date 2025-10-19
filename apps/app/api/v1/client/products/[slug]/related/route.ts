import { prisma } from '@/lib/prisma';
import { ProductStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";


export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const body = await request.json();
        const { categoryIds, merchantId } = body;

        const relatedProducts = await prisma.product.findMany({
            where: {
                slug: { not: slug },
                status: ProductStatus.VERIFIED,
                visibility: true,
                OR: [
                    {
                        categories: {
                            some: {
                                categoryId: { in: categoryIds },
                            },
                        },
                    },
                    {
                        merchantId: merchantId,
                    },
                ],
            },
            include: {
                images: true,
                categories: {
                    include: {
                        category: true
                    }
                },
                merchant: true,
            },
            take: 12,
            orderBy: [
                { createdAt: "desc" },
            ],
        });

        return NextResponse.json({
            success: true,
            data: relatedProducts
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}