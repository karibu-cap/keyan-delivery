import { getMerchantProducts } from '@/lib/actions/server/merchants';
import { verifySession } from '@/lib/auth-server';
import { invalidateProductCache } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/utils';
import { ProductStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

interface ProductImageInput {
    url: string;
    fileName?: string;
    blurDataUrl?: string;
    categoryIds?: string[];
}

export async function GET(request: NextRequest, props: { params: Promise<{ merchantId: string }> }) {
    const params = await props.params
    const merchantId = params.merchantId;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const status = statusParam && Object.values(ProductStatus).includes(statusParam as ProductStatus)
        ? statusParam as ProductStatus
        : undefined;
    const search = searchParams.get('search');
    const limitParam = searchParams.get('limit') || '50';
    const offsetParam = searchParams.get('offset') || '0';
    const limit = Math.max(1, Math.min(100, parseInt(limitParam))); // Between 1 and 100
    const offset = Math.max(0, parseInt(offsetParam));

    const result = await getMerchantProducts(merchantId, {
        status,
        search: search || undefined,
        limit,
        offset,
    });

    if (!result) {
        return NextResponse.json({
            success: false,
            error: 'No products found',
        }, { status: 404 });
    }

    return NextResponse.json(result);
}

export async function POST(request: NextRequest, props: { params: Promise<{ merchantId: string }> }) {
    try {
        const params = await props.params;
        const token = await verifySession();

        if (!token?.user.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: token.user.id },
            include: {
                merchantManagers: true
            }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        const userMerchants = await prisma.userMerchantManager.findMany({
            where: {
                userId: user?.id,
            },
            include: {
                merchant: true,
            },
        });

        if (userMerchants.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No merchant access' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const {
            title,
            description,
            price,
            compareAtPrice,
            stock,
            unit,
            categoryIds,
            status,
            weight,
            weightUnit,
            badges,
            images,
        } = body;


        if (!title || !description || !price || stock === undefined) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const slug = generateSlug(title);

        const product = await prisma.product.create({
            data: {
                title,
                slug,
                description,
                price: parseFloat(price),
                compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
                unit: unit || 'unit',
                status: status || ProductStatus.DRAFT,
                visibility: status === ProductStatus.WAITING_FOR_REVIEW,
                merchantId: params.merchantId,
                creatorId: user.id,
                weight: weight ? parseFloat(weight) : null,
                weightUnit: weightUnit || 'lb',
                badges: badges || [],
                inventory: {
                    quantity: parseInt(stock),
                    stockQuantity: parseInt(stock),
                    lowStockThreshold: 5
                },
                metadata: {
                    seoTitle: title,
                    seoDescription: description.substring(0, 160),
                    keywords: title.split(' ').filter((w: string) => w.length > 3)
                },
                images: images && images.length > 0 ? {
                    create: images
                        .filter((image: ProductImageInput) => image && image.url)
                        .map((image: ProductImageInput) => ({
                            url: image.url,
                            fileName: image.fileName || `product-image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            blurDataUrl: image.blurDataUrl,
                            creatorId: user.id,
                        }))
                } : undefined,
                categories: categoryIds && categoryIds.length > 0 ? {
                    create: categoryIds.map((categoryId: string) => ({
                        category: {
                            connect: { id: categoryId }
                        }
                    }))
                } : undefined
            },
            include: {
                images: true,
                categories: {
                    include: {
                        category: true
                    }
                }
            }
        });

        // Invalidate product cache after successful creation
        await invalidateProductCache();

        return NextResponse.json({
            success: true,
            data: product,
            message: status === ProductStatus.VERIFIED
                ? 'Product submitted for review'
                : 'Product saved as draft'
        });

    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create product' },
            { status: 500 }
        );
    }
}
