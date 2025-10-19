import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${baseUrl}/stores`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/cart`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.5,
        },
    ];

    try {
        // Fetch products
        const products = await prisma.product.findMany({
            where: {
                status: ProductStatus.VERIFIED,
                visibility: true,
            },
            select: {
                slug: true,
                updatedAt: true,
            },
            take: 1000, // Limit for performance
            orderBy: {
                updatedAt: "desc",
            },
        });

        const productPages: MetadataRoute.Sitemap = products.map((product) => ({
            url: `${baseUrl}/products/${product.slug}`,
            lastModified: product.updatedAt,
            changeFrequency: "weekly",
            priority: 0.8,
        }));

        // Fetch merchants/stores
        const merchants = await prisma.merchant.findMany({
            where: {
                isVerified: true,
            },
            select: {
                slug: true,
                updatedAt: true,
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        const merchantPages: MetadataRoute.Sitemap = merchants.map((merchant) => ({
            url: `${baseUrl}/stores/${merchant.slug}`,
            lastModified: merchant.updatedAt,
            changeFrequency: "monthly",
            priority: 0.9,
        }));

        // Fetch categories
        const categories = await prisma.category.findMany({
            select: {
                slug: true,
                updatedAt: true,
            },
        });

        const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
            url: `${baseUrl}/categories/${category.slug}`,
            lastModified: category.updatedAt,
            changeFrequency: "monthly",
            priority: 0.7,
        }));

        return [...staticPages, ...productPages, ...merchantPages, ...categoryPages];
    } catch (error) {
        console.error("Error generating sitemap:", error);
        return staticPages;
    }
}
