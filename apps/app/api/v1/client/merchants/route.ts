import { getCachedMerchants } from '@/lib/cache';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Use cached function instead of direct Prisma calls
    const merchants = await getCachedMerchants({
      search: search || undefined,
      limit,
      offset
    });

    // We need to get total count separately since getCachedMerchants doesn't return pagination info
    // Let's create a cached count function or use the existing pattern
    const { prisma } = await import('@/lib/prisma');
    const whereClause: Record<string, unknown> = {
      isVerified: true,
    };

    if (search) {
      whereClause.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
      ];
    }

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
    }, {
      headers: {
        'Cache-Control': 'public, max-age=600, s-maxage=1200', // 10 min public, 20 min shared
        'CDN-Cache-Control': 'max-age=1200',
        'Vercel-CDN-Cache-Control': 'max-age=1200',
      }
    });

  } catch (error) {
    console.error('Error fetching merchants:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch merchants' },
      { status: 500 }
    );
  }
}