import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params

    const merchant = await prisma.merchant.findUnique({
      where: {
        id: params.id,
        isVerified: true,
      },
      include: {
        products: {
          where: {
            status: 'VERIFIED',
            visibility: true,
          },
          include: {
            images: true,
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
        categories: {
          select: {
            category: true,
          },
        },
        managers: {
          include: {
            user: {
              select: {
                fullName: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!merchant) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      );
    }

    // Generate aisles from categories
    const categories: Record<string, unknown> = {}
    merchant.categories.forEach((category) => {
      categories[category.category.id] = {
        id: category.category.id,
        name: category.category.name,
        count: merchant.products.filter((product) =>
          product.categories.some((c) => c.categoryId === category.category.id)
        ).length,
      }
    })
    const aisles = Object.values(categories)

    console.log(merchant)

    return NextResponse.json({
      success: true,
      data: {
        merchant: merchant,
        aisles,
      },
    });

  } catch (error) {
    console.error('Error fetching store:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch store' },
      { status: 500 }
    );
  }
}