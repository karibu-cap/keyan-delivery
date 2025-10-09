import { Prisma, PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const limit = parseInt(searchParams.get('limit') || '18');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const whereClause: Prisma.CategoryWhereInput = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
      include: {
        image: {
          select: { url: true }
        },
        _count: {
          select: {
            products: true
          }
        }
      },
      take: limit,
      skip: offset,
    });

    const totalCount = await prisma.category.count({ where: whereClause });

    // Transform the data to include product count and add default categories
    const transformedCategories = [
      {
        id: 'all',
        name: 'All Categories',
        slug: 'all',
        description: 'All available categories',
        productCount: 0,
      },
      ...categories.map(category => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        productCount: category._count.products,
        image: category.image?.url,
        seoMetadata: category.seoMetadata,
      }))
    ];

    return NextResponse.json({
      success: true,
      data: {
        categories: transformedCategories,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        }
      }
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}