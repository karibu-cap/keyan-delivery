import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const whereClause: Prisma.MerchantWhereInput = {
      isVerified: true,
    };

    if (search) {
      whereClause.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { categories: { some: { category: { name: { contains: search, mode: 'insensitive' } } } } },
      ];
    }

    if (category && category !== 'all') {
      whereClause.categories = {
        some: {
          categoryId: category
        }
      };
    }

    const merchants = await prisma.merchant.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        products: {
          where: { status: 'VERIFIED', visibility: true },
          select: { id: true }
        },
        categories: {
          select: { category: true }
        },
        managers: {
          include: {
            user: {
              select: { fullName: true, phone: true }
            }
          }
        }
      }
    });

    const totalCount = await prisma.merchant.count({ where: whereClause });

  

    return NextResponse.json({
      success: true,
      data: {
        merchants: merchants,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        }
      }
    });

  } catch (error) {
    console.error('Error fetching merchants:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch merchants' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}