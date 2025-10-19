import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            where: {
                status: ProductStatus.VERIFIED,
                visibility: true,
            },
            select: {
                slug: true,
                updatedAt: true,
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${products
    .map(
        (product) => `  <url>
    <loc>${baseUrl}/products/${product.slug}</loc>
    <lastmod>${product.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("\n")}
</urlset>`;

        return new NextResponse(sitemap, {
            headers: {
                "Content-Type": "application/xml",
                "Cache-Control": "public, max-age=3600, s-maxage=3600",
            },
        });
    } catch (error) {
        console.error("Error generating products sitemap:", error);
        return new NextResponse("Error generating sitemap", { status: 500 });
    }
}
