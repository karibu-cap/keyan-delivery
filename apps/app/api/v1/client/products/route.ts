import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchantId');
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const merchantType = searchParams.get('merchantType');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: Record<string, unknown> = {
      visibility: true,
      status: 'VERIFIED'
    };

    if (merchantId) {
      where.merchantId = merchantId;
    }

    if (merchantType) {
      where.merchant = {
        merchantType: merchantType
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (categoryId) {
      where.categories = {
        some: {
          categoryId: categoryId
        }
      };
    }

    const products = await prisma.product.findMany({
      where,
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
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset
    });

    const total = await prisma.product.count({ where });

    return NextResponse.json({
      success: true,
      data: {
        products,
        total,
        limit,
        offset
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}