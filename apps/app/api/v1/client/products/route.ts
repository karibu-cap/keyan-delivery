import { getCachedProductCount, getCachedProducts } from '@/lib/cache';
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

    // Build filters for cached functions
    const filters: Parameters<typeof getCachedProducts>[0] = {
      merchantId: merchantId || undefined,
      categoryId: categoryId || undefined,
      search: search || undefined,
      merchantType: merchantType || undefined,
      limit,
      offset
    };

    // Use cached functions instead of direct Prisma calls
    const products = await getCachedProducts(filters);
    const total = await getCachedProductCount({
      merchantId: merchantId || undefined,
      categoryId: categoryId || undefined,
      search: search || undefined,
      merchantType: merchantType || undefined
    });

    return NextResponse.json({
      success: true,
      data: {
        products,
        total,
        limit,
        offset
      }
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600', // 5 min public, 10 min shared
        'CDN-Cache-Control': 'max-age=600',
        'Vercel-CDN-Cache-Control': 'max-age=600',
      }
    });
  } catch (error) {
    console.error({ message: 'Error fetching products:', error });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}