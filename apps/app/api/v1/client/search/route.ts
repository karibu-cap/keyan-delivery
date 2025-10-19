import { SearchResult } from '@/lib/actions/client';
import { getCachedSearchResults } from '@/lib/cache';
import { NextRequest, NextResponse } from 'next/server';
import { performAdvancedSearch } from '@/lib/search/vector-search';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';

        if (!query.trim()) {
            return NextResponse.json({
                success: true,
                results: []
            });
        }

        const searchTerm = query.trim();

        // Optional engine selection: lexical (default), semantic, or hybrid
        const engine = (searchParams.get('engine') || '').toLowerCase();
        const hybridParam = (searchParams.get('hybrid') || '').toLowerCase();
        const categoryId = searchParams.get('categoryId') || undefined;
        const merchantId = searchParams.get('merchantId') || undefined;
        const limitParam = parseInt(searchParams.get('limit') || '15', 10);
        const limit = isNaN(limitParam) ? 15 : Math.min(Math.max(limitParam, 1), 50);
        const thresholdParam = parseFloat(searchParams.get('threshold') || '');
        const threshold = isNaN(thresholdParam) ? undefined : Math.min(Math.max(thresholdParam, 0), 1);

        const useHybrid = engine === 'hybrid' || hybridParam === '1' || hybridParam === 'true';
        const useSemantic = engine === 'semantic' || useHybrid;

        let results: SearchResult[] = [];

        if (useSemantic) {
            const vectorResults = await performAdvancedSearch(searchTerm, {
                filters: { categoryId, merchantId },
                limit,
                useHybrid,
                threshold,
            });

            results = vectorResults.map(r => ({
                id: r.product.id,
                title: r.product.title,
                type: 'product',
                image: r.product.images?.[0]?.url,
                price: r.product.price,
                category: r.product.categories?.[0]?.category?.name,
                product: r.product as any,
            }));
        } else {
            // Default to cached lexical search
            const products = await getCachedSearchResults(searchTerm, {
                limit,
                ...(categoryId ? { categoryId } : {}),
                ...(merchantId ? { merchantId } : {}),
            });

            results = products.map(product => ({
                id: product.id,
                title: product.title,
                type: 'product',
                image: product.images[0]?.url,
                price: product.price,
                category: product.categories[0]?.category.name,
                product: product as any,
            }));
        }

        return NextResponse.json({
            success: true,
            results: results.slice(0, limit)
        }, {
          headers: {
            'Cache-Control': 'public, max-age=60, s-maxage=120', // 1 min public, 2 min shared (search results change frequently)
            'CDN-Cache-Control': 'max-age=120',
            'Vercel-CDN-Cache-Control': 'max-age=120',
          }
        });

    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to perform search' },
            { status: 500 }
        );
    }
}