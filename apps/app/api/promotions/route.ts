import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchantId');
    const isActive = searchParams.get('isActive') !== 'false'; // Default to true

    const where: any = {
      isActive
    };

    if (merchantId) {
      where.product = {
        merchantId
      };
    }

    const promotions = await prisma.productPromotion.findMany({
      where,
      include: {
        product: {
          include: {
            media: true,
            merchant: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: promotions
    });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch promotions' },
      { status: 500 }
    );
  }
}