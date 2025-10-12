import { SearchResult } from '@/lib/actions/client';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';

        if (!query.trim()) {
            return NextResponse.json({
                success: true,
                results: []
            });
        }

        const searchTerm = query.trim();


        const [merchants, products] = await Promise.all([
            prisma.merchant.findMany({
                where: {
                    isVerified: true,
                    OR: [
                        { businessName: { contains: searchTerm, mode: 'insensitive' } },
                    ]
                },
                take: 5,
                include: {
                    products: {
                        include: {
                            categories: {
                                include: {
                                    category: true
                                }
                            },
                            images: true,
                            merchant: true,
                            _count: {
                                select: {
                                    OrderItem: true,
                                    cartItems: true,
                                },
                            },
                        }
                    },
                    managers: true,
                }

            }),

            prisma.product.findMany({
                where: {
                    AND: [
                        { visibility: true },
                        { status: 'VERIFIED' },
                        {
                            OR: [
                                { title: { contains: searchTerm, mode: 'insensitive' } },
                                { description: { contains: searchTerm, mode: 'insensitive' } }
                            ]
                        }
                    ]
                },
                take: 10,
                include: {
                    categories: {
                        include: {
                            category: true
                        }
                    },
                    images: true,
                    merchant: true,
                    _count: {
                        select: {
                            OrderItem: true,
                            cartItems: true,
                        },
                    },
                }
            })
        ]);


        const results: SearchResult[] = [];

        merchants.forEach(merchant => {
            results.push({
                id: merchant.id,
                title: merchant.businessName,
                type: 'merchant',
                image: merchant.logoUrl ?? undefined,
                merchant: merchant
            });
        });

        products.forEach(product => {
            results.push({
                id: product.id,
                title: product.title,
                type: 'product',
                image: product.images[0]?.url,
                price: product.price,
                category: product.categories[0]?.category.name,
                product: product
            });
        });

        return NextResponse.json({
            success: true,
            results: results.slice(0, 15)
        });

    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to perform search' },
            { status: 500 }
        );
    }
}