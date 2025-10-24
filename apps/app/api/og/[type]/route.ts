import { generateOGImage } from '@/lib/og-generator';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Dynamic OG Image Generation API Route
export async function GET(request: NextRequest, props: { params: Promise<{ type: string }> }) {
    const params = await props.params;
    try {
        const { searchParams } = new URL(request.url);
        const id:= searchParams.get('id');
        const locale = searchParams.get('locale') || 'en';

        if (!id) {
            return NextResponse.json(
                { error: 'ID parameter is required' },
                { status: 400 }
            );
        }

        let data: any = null;

        switch (params.type) {
            case 'product':
                data = await getProductData(id);
                break;
            case 'merchant':
                data = await getMerchantData(id);
                break;
            case 'category':
                data = await getCategoryData(id);
                break;
            default:
                return NextResponse.json(
                    { error: 'Invalid type parameter' },
                    { status: 400 }
                );
        }

        if (!data) {
            return NextResponse.json(
                { error: 'Resource not found' },
                { status: 404 }
            );
        }

        // Generate professional OG image using the advanced library
        const ogImage = await generateOGImage(params.type.toUpperCase() as any, data);

        return new NextResponse(ogImage.body, {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });

    } catch (error) {
        console.error('OG Image generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate OG image' },
            { status: 500 }
        );
    }
}

// Fetch product data for OG image
async function getProductData(productId: string) {
    try {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                images: true,
                merchant: true,
                categories: {
                    include: {
                        category: true,
                    },
                },
            },
        });

        if (!product || !product.visibility || product.status !== 'VERIFIED') {
            return null;
        }

        return {
            title: product.title,
            price: product.price,
            image: product.images[0]?.url,
            merchantName: product.merchant.businessName,
            categoryName: product.categories[0]?.category.name,
            rating: product.rating,
            badge: product.badges?.length > 0 ? product.badges[0] : undefined,
        };
    } catch (error) {
        console.error('Error fetching product data:', error);
        return null;
    }
}

// Fetch merchant data for OG image
async function getMerchantData(merchantId: string) {
    try {
        const merchant = await prisma.merchant.findUnique({
            where: { id: merchantId },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        if (!merchant || !merchant.isVerified) {
            return null;
        }

        return {
            businessName: merchant.businessName,
            merchantType: merchant.merchantType,
            logoUrl: merchant.logoUrl,
            bannerUrl: merchant.bannerUrl,
            rating: merchant.rating,
            deliveryTime: merchant.deliveryTime,
            isVerified: merchant.isVerified,
            productCount: merchant._count.products,
        };
    } catch (error) {
        console.error('Error fetching merchant data:', error);
        return null;
    }
}

// Fetch category data for OG image
async function getCategoryData(categoryId: string) {
    try {
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
                image: true,
            },
        });

        if (!category) {
            return null;
        }

        return {
            name: category.name,
            description: category.description,
            imageUrl: category.image?.url,
            productCount: category._count.products,
        };
    } catch (error) {
        console.error('Error fetching category data:', error);
        return null;
    }
}
