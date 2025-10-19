import { getCachedCategories } from '@/lib/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const limit = parseInt(searchParams.get('limit') || '18');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    // Use cached function instead of direct Prisma calls
    const categories = await getCachedCategories();

    // Apply search filter if provided (since getCachedCategories doesn't support search)
    let filteredCategories = categories;
    if (search) {
      filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(search.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Apply pagination
    const startIndex = offset;
    const endIndex = startIndex + limit;
    const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

    // Transform the data to include product count and add default categories
    const transformedCategories = [
      {
        id: 'all',
        name: 'All Categories',
        slug: 'all',
        description: 'All available categories',
        productCount: 0,
      },
      ...paginatedCategories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        productCount: 0, // We'll need to get this separately or modify the cache function
        image: null, // getCachedCategories doesn't include image data
        seoMetadata: null,
      }))
    ];

    return NextResponse.json({
      success: true,
      data: {
        categories: transformedCategories,
        pagination: {
          total: filteredCategories.length,
          limit,
          offset,
          hasMore: endIndex < filteredCategories.length,
        }
      }
    }, {
      headers: {
        'Cache-Control': 'public, max-age=1800, s-maxage=3600', // 30 min public, 1 hour shared
        'CDN-Cache-Control': 'max-age=3600',
        'Vercel-CDN-Cache-Control': 'max-age=3600',
      }
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
