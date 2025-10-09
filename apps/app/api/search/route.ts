import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

interface SearchResult {
  id: string;
  title: string;
  type: 'product' | 'merchant' | 'category';
  image?: string;
  price?: number;
  category?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const searchTerm = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Search products
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } }
        ],
        stock: { gt: 0 }
      },
      take: 8,
      include: {
        media: true,
        categories: {
          include: {
            category: true
          }
        }
      }
    });

    // Add products to results
    products.forEach(product => {
      results.push({
        id: product.id,
        title: product.title,
        type: 'product',
        image: product.media?.url,
        price: product.price,
        category: product.categories?.[0]?.category?.name
      });
    });

    // Search merchants
    const merchants = await prisma.merchant.findMany({
      where: {
        businessName: { contains: searchTerm, mode: 'insensitive' }
      },
      take: 4
    });

    // Add merchants to results
    merchants.forEach(merchant => {
      results.push({
        id: merchant.id,
        title: merchant.businessName,
        type: 'merchant',
        image: merchant.logoUrl || undefined,
        category: merchant.merchantType
      });
    });

    // Search categories
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      take: 4
    });

    // Add categories to results
    categories.forEach(category => {
      results.push({
        id: category.id,
        title: category.name,
        type: 'category',
        category: 'Category'
      });
    });

    // Sort results by relevance (products first, then merchants, then categories)
    results.sort((a, b) => {
      const typeOrder = { product: 0, merchant: 1, category: 2 };
      return typeOrder[a.type] - typeOrder[b.type];
    });

    return NextResponse.json({ results: results.slice(0, 12) });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}