import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

// Type for the category with included relations from Prisma query
type CategoryWithRelations = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: { url: string } | null;
  _count: { products: number };
  seoMetadata?: {
    seoTitle?: string | null;
    seoDescription?: string | null;
    keywords?: string[];
  } | null;
};

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantType = searchParams.get('merchantType');

    const where: Record<string, unknown> = {};
    if (merchantType) {
       where.merchants = {
         some: {
           merchant: {
             merchantType: merchantType
           }
         }
       };
     }

    const categories = await prisma.category.findMany({
      where,
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
      }
    });

    // Transform the data to include product count and add default categories
    const transformedCategories = [
      {
        id: 'all',
        name: 'All Categories',
        slug: 'all',
        description: 'All available categories',
        productCount: 0,
      },
      ...categories.map((category: CategoryWithRelations) => ({
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
