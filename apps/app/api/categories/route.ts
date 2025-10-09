import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
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
        name: 'All Stores',
        slug: 'all',
        description: 'All available stores',
        productCount: 0, // Will be calculated from all merchants
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