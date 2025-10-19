// Enhanced Sitemap Generation with Next.js Optimizations
import { generateSitemapData } from '@/lib/metadata';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Generate XML sitemap for SEO with Next.js best practices
export async function GET(request: Request) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const url = new URL(request.url);
        const sitemapType = url.searchParams.get('type'); // ?type=products, merchants, categories, static

        // Handle specific sitemap types
        if (sitemapType === 'products') {
            return await generateProductsSitemap();
        }

        if (sitemapType === 'merchants') {
            return await generateMerchantsSitemap();
        }

        if (sitemapType === 'categories') {
            return await generateCategoriesSitemap();
        }

        if (sitemapType === 'static') {
            return await generateStaticPagesSitemap();
        }

        if (sitemapType === 'index') {
            const indexXml = await generateSitemapIndex();
            return new NextResponse(indexXml, {
                headers: {
                    'Content-Type': 'application/xml',
                    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
                },
            });
        }

        if (sitemapType === 'stats') {
            const stats = await getSitemapStats();
            return NextResponse.json(stats);
        }

        // Default: Generate comprehensive sitemap (for smaller sites or when no type specified)
        return await generateComprehensiveSitemapWithStructuredData();

    } catch (error) {
        console.error('Sitemap generation error:', error);

        return NextResponse.json(
            { error: 'Failed to generate sitemap' },
            { status: 500 }
        );
    }
}
// Generate sitemap index for multiple sitemaps (for large sites)
async function generateSitemapIndex(): Promise<string> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Get stats to determine which sitemaps to include
    const stats = await getSitemapStats();
    if (!stats) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
        <loc>${baseUrl}/sitemap.xml</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>
</sitemapindex>`;
    }

    let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add comprehensive sitemap if we have URLs
    if (stats.totalUrls > 0) {
        sitemapIndex += `
    <sitemap>
        <loc>${baseUrl}/sitemap.xml</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>`;
    }

    // Add specific sitemaps if they have content
    if (stats.products > 0) {
        sitemapIndex += `
    <sitemap>
        <loc>${baseUrl}/sitemap.xml?type=products</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>`;
    }

    if (stats.merchants > 0) {
        sitemapIndex += `
    <sitemap>
        <loc>${baseUrl}/sitemap.xml?type=merchants</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>`;
    }

    if (stats.categories > 0) {
        sitemapIndex += `
    <sitemap>
        <loc>${baseUrl}/sitemap.xml?type=categories</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>`;
    }

    sitemapIndex += `
    <sitemap>
        <loc>${baseUrl}/sitemap.xml?type=static</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>
</sitemapindex>`;

    return sitemapIndex;
}



// Generate comprehensive sitemap using structured data function (for smaller sites)
async function generateComprehensiveSitemapWithStructuredData(): Promise<NextResponse> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Use the generateSitemapData function from metadata.ts for consistent data
        const sitemapData = await generateSitemapData();

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

    <!-- Homepage -->
    <url>
        <loc>${baseUrl}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>

    <!-- Products -->
    ${sitemapData.products.map((product: { url: string; lastModified: Date; changeFrequency: string; priority: number }) => `
    <url>
        <loc>${product.url}</loc>
        <lastmod>${product.lastModified.toISOString()}</lastmod>
        <changefreq>${product.changeFrequency}</changefreq>
        <priority>${product.priority}</priority>
    </url>`).join('')}

    <!-- Merchants -->
    ${sitemapData.merchants.map((merchant: { url: string; lastModified: Date; changeFrequency: string; priority: number }) => `
    <url>
        <loc>${merchant.url}</loc>
        <lastmod>${merchant.lastModified.toISOString()}</lastmod>
        <changefreq>${merchant.changeFrequency}</changefreq>
        <priority>${merchant.priority}</priority>
    </url>`).join('')}

    <!-- Categories -->
    ${sitemapData.categories.map((category: { url: string; lastModified: Date; changeFrequency: string; priority: number }) => `
    <url>
        <loc>${category.url}</loc>
        <lastmod>${category.lastModified.toISOString()}</lastmod>
        <changefreq>${category.changeFrequency}</changefreq>
        <priority>${category.priority}</priority>
    </url>`).join('')}

    <!-- Static Pages -->
    <url>
        <loc>${baseUrl}/stores</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>

    <url>
        <loc>${baseUrl}/categories</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>

    <url>
        <loc>${baseUrl}/cart</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>never</changefreq>
        <priority>0.3</priority>
    </url>

    <url>
        <loc>${baseUrl}/orders</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>never</changefreq>
        <priority>0.3</priority>
    </url>
</urlset>`;

        return new NextResponse(sitemap, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        });
    } catch (error) {
        console.error('Error generating comprehensive sitemap with structured data:', error);
        return NextResponse.json(
            { error: 'Failed to generate sitemap' },
            { status: 500 }
        );
    }
}

// Generate comprehensive sitemap (for smaller sites)
async function generateComprehensiveSitemap(): Promise<NextResponse> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Get data directly from database for better performance
        const [products, merchants, categories] = await Promise.all([
            prisma.product.findMany({
                where: { visibility: true, status: 'VERIFIED' },
                select: { slug: true, updatedAt: true },
                orderBy: { updatedAt: 'desc' },
                take: 10000, // Limit for comprehensive sitemap
            }),
            prisma.merchant.findMany({
                where: { isVerified: true },
                select: { slug: true, updatedAt: true },
                orderBy: { updatedAt: 'desc' },
            }),
            prisma.category.findMany({
                select: { slug: true, updatedAt: true },
                orderBy: { updatedAt: 'desc' },
            }),
        ]);

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

    <!-- Homepage -->
    <url>
        <loc>${baseUrl}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>

    <!-- Products -->
    ${products.map((product: { slug: string; updatedAt: Date }) => `
    <url>
        <loc>${baseUrl}/products/${product.slug}</loc>
        <lastmod>${product.updatedAt.toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`).join('')}

    <!-- Merchants -->
    ${merchants.map((merchant: { slug: string; updatedAt: Date }) => `
    <url>
        <loc>${baseUrl}/stores/${merchant.slug}</loc>
        <lastmod>${merchant.updatedAt.toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.9</priority>
    </url>`).join('')}

    <!-- Categories -->
    ${categories.map((category: { slug: string; updatedAt: Date }) => `
    <url>
        <loc>${baseUrl}/categories/${category.slug}</loc>
        <lastmod>${category.updatedAt.toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>`).join('')}

    <!-- Static Pages -->
    <url>
        <loc>${baseUrl}/stores</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>

    <url>
        <loc>${baseUrl}/categories</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>

    <url>
        <loc>${baseUrl}/cart</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>never</changefreq>
        <priority>0.3</priority>
    </url>

    <url>
        <loc>${baseUrl}/orders</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>never</changefreq>
        <priority>0.3</priority>
    </url>
</urlset>`;

        return new NextResponse(sitemap, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        });
    } catch (error) {
        console.error('Error generating comprehensive sitemap:', error);
        return NextResponse.json(
            { error: 'Failed to generate sitemap' },
            { status: 500 }
        );
    }
}

// Generate products-only sitemap
async function generateProductsSitemap(): Promise<NextResponse> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
        const products = await prisma.product.findMany({
            where: { visibility: true, status: 'VERIFIED' },
            select: { slug: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
            take: 50000, // Sitemap limit is 50,000 URLs
        });

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${products.map((product: { slug: string; updatedAt: Date }) => `
    <url>
        <loc>${baseUrl}/products/${product.slug}</loc>
        <lastmod>${product.updatedAt.toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`).join('')}
</urlset>`;

        return new NextResponse(sitemap, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        });
    } catch (error) {
        console.error('Error generating products sitemap:', error);
        return NextResponse.json(
            { error: 'Failed to generate products sitemap' },
            { status: 500 }
        );
    }
}

// Generate merchants-only sitemap
async function generateMerchantsSitemap(): Promise<NextResponse> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
        const merchants = await prisma.merchant.findMany({
            where: { isVerified: true },
            select: { slug: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
        });

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${merchants.map((merchant: { slug: string; updatedAt: Date }) => `
    <url>
        <loc>${baseUrl}/stores/${merchant.slug}</loc>
        <lastmod>${merchant.updatedAt.toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.9</priority>
    </url>`).join('')}
</urlset>`;

        return new NextResponse(sitemap, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        });
    } catch (error) {
        console.error('Error generating merchants sitemap:', error);
        return NextResponse.json(
            { error: 'Failed to generate merchants sitemap' },
            { status: 500 }
        );
    }
}

// Generate categories-only sitemap
async function generateCategoriesSitemap(): Promise<NextResponse> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
        const categories = await prisma.category.findMany({
            select: { slug: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
        });

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${categories.map((category: { slug: string; updatedAt: Date }) => `
    <url>
        <loc>${baseUrl}/categories/${category.slug}</loc>
        <lastmod>${category.updatedAt.toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>`).join('')}
</urlset>`;

        return new NextResponse(sitemap, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        });
    } catch (error) {
        console.error('Error generating categories sitemap:', error);
        return NextResponse.json(
            { error: 'Failed to generate categories sitemap' },
            { status: 500 }
        );
    }
}

// Generate static pages sitemap
async function generateStaticPagesSitemap(): Promise<NextResponse> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
        const currentDate = new Date().toISOString();

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${baseUrl}/stores</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>${baseUrl}/categories</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>${baseUrl}/cart</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>never</changefreq>
        <priority>0.3</priority>
    </url>
    <url>
        <loc>${baseUrl}/orders</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>never</changefreq>
        <priority>0.3</priority>
    </url>
</urlset>`;

        return new NextResponse(sitemap, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        });
    } catch (error) {
        console.error('Error generating static pages sitemap:', error);
        return NextResponse.json(
            { error: 'Failed to generate static pages sitemap' },
            { status: 500 }
        );
    }
}

// API endpoint to get sitemap statistics
async function getSitemapStats() {
    try {
        const [products, merchants, categories] = await Promise.all([
            prisma.product.count({
                where: { visibility: true, status: 'VERIFIED' }
            }),
            prisma.merchant.count({
                where: { isVerified: true }
            }),
            prisma.category.count(),
        ]);

        return {
            products,
            merchants,
            categories,
            totalUrls: products + merchants + categories + 5, // +5 for static pages
            lastGenerated: new Date().toISOString(),
        };
    } catch (error) {
        console.error('Error getting sitemap stats:', error);
        return null;
    }
}