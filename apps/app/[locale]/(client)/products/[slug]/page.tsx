import { ProductDetailClient } from "@/components/client/products/ProductDetailClient";
import { fetchProduct, fetchRelatedProducts } from "@/lib/actions/server/stores";
import { generateProductMetadata } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface ProductPageProps {
    params: Promise<{
        slug: string;
        locale: string;
    }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const { slug, locale } = await params;

    const product = await prisma.product.findUnique({
        where: { slug },
        select: { id: true },
    });

    if (!product) {
        return {
            title: "Product Not Found",
        };
    }

    return generateProductMetadata(product.id, locale);
}

// Generate static params for static generation
export async function generateStaticParams() {
    const products = await prisma.product.findMany({
        where: {
            status: ProductStatus.VERIFIED,
            visibility: true,
        },
        select: { slug: true },
        take: 100, // Limit to top 100 products for build time
    });

    return products.map((product) => ({
        slug: product.slug,
    }));
}

// Revalidate every hour
export const revalidate = 3600;



export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;

    const product = await fetchProduct(slug);

    if (!product || product.status !== ProductStatus.VERIFIED || !product.visibility) {
        notFound();
    }

    const categoryIds = product.categories?.map((c) => c.categoryId) || [];
    const relatedProducts = await fetchRelatedProducts(product.slug, categoryIds, product.merchantId);


    return (
        <>
            <ProductDetailClient product={product} relatedProducts={relatedProducts} />
        </>
    );
}
