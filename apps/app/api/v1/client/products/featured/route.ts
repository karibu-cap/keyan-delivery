import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get products that are on sale or have promotions
    const products = await prisma.product.findMany({
      where: {
        visibility: true,
        status: 'VERIFIED',
        OR: [
          { compareAtPrice: { not: null } },
          { promotions: { some: { isActive: true } } },
          { badges: { has: 'BEST_SELLER' } }
        ]
      },
      include: {
        images: true,
        categories: {
          include: {
            category: true
          }
        },
        merchant: true,
        promotions: true
      },
      orderBy: [
        { promotions: { _count: 'desc' } },
        { createdAt: 'desc' }
      ],
      take: limit
    });

    return NextResponse.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch featured products' },
      { status: 500 }
    );
  }
}