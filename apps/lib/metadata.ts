import type { Merchant } from '@prisma/client';
import { Metadata } from 'next';
import { prisma } from './prisma';

// Base metadata configuration
export const baseMetadata = {
    title: {
        default: 'Yetu Delivery - Fast & Fresh Grocery Delivery',
        template: '%s | Yetu Delivery',
    },
    description: 'Get fresh groceries, food, and pharmacy items delivered to your door in minutes. Fast, reliable delivery service with real-time tracking.',
    keywords: [
        'grocery delivery',
        'food delivery',
        'pharmacy delivery',
        'online shopping',
        'fresh produce',
        'fast delivery',
        'local delivery',
    ],
    authors: [{ name: 'Yetu Delivery' }],
    creator: 'Yetu Delivery',
    publisher: 'Yetu Delivery',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || ''),
    alternates: {
        canonical: '/',
        languages: {
            'en-US': '/en',
            'sw-KE': '/sw',
        },
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: '/',
        title: 'Yetu Delivery - Fast & Fresh Grocery Delivery',
        description: 'Get fresh groceries, food, and pharmacy items delivered to your door in minutes.',
        siteName: 'Yetu Delivery',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Yetu Delivery - Fast & Fresh Grocery Delivery',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Yetu Delivery - Fast & Fresh Grocery Delivery',
        description: 'Get fresh groceries, food, and pharmacy items delivered to your door in minutes.',
        images: ['/og-image.jpg'],
        creator: '@Yetudelivery',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    } as const,
    verification: process.env.GOOGLE_VERIFICATION ? {
        google: process.env.GOOGLE_VERIFICATION,
    } : undefined,
};

// Generate metadata for home page
export async function generateHomeMetadata(locale = 'en'): Promise<Metadata> {
    return {
        ...baseMetadata,
        title: locale === 'en' ? 'Yetu Delivery - Fast & Fresh Grocery Delivery' : 'Yetu Delivery - Uwasilishaji Haraka wa Mboga',
        description: locale === 'en'
            ? 'Get fresh groceries, food, and pharmacy items delivered to your door in minutes. Fast, reliable delivery service with real-time tracking.'
            : 'Pata mboga, chakula na dawa zilizowasilishwa mlangoni mwako kwa dakika. Huduma ya uwasilishaji wa haraka na ya kuaminika yenye ufuatiliaji wa wakati halisi.',
    };
}

// Generate metadata for product pages
export async function generateProductMetadata(
    productId: string,
    locale = 'en'
): Promise<Metadata> {
    try {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                images: true,
                categories: {
                    include: {
                        category: true,
                    },
                },
                merchant: true,
            },
        });

        if (!product) {
            return {
                ...baseMetadata,
                title: 'Product Not Found',
            };
        }

        const title = locale === 'en'
            ? `${product.title} - Fresh & Quality | Yetu Delivery`
            : `${product.title} - Ubora na Safi | Yetu Delivery`;

        const description = locale === 'en'
            ? `Buy ${product.title} from ${product.merchant.businessName}. ${product.description.substring(0, 160)}...`
            : `Nunua ${product.title} kutoka ${product.merchant.businessName}. ${product.description.substring(0, 160)}...`;

        const categories = product.categories.map(cat => cat.category.name).join(', ');

        return {
            ...baseMetadata,
            title,
            description,
            keywords: [
                ...baseMetadata.keywords,
                product.title,
                categories,
                product.merchant.businessName,
                'fresh food',
                'quality products',
            ],
            openGraph: {
                ...baseMetadata.openGraph,
                title,
                description,
                url: `/products/${product.slug}`,
                images: product.images.length > 0 ? [
                    {
                        url: product.images[0].url,
                        width: 1200,
                        height: 630,
                        alt: product.title,
                    },
                ] : baseMetadata.openGraph.images,
                type: 'website',
            },
            twitter: {
                ...baseMetadata.twitter,
                title,
                description,
                images: product.images.length > 0 ? [product.images[0].url] : baseMetadata.twitter.images,
            },
        };
    } catch (error) {
        console.error({ message: 'Error generating product metadata:', error });
        return {
            ...baseMetadata,
            title: 'Product - Yetu Delivery',
        };
    }
}

// Generate metadata for merchant/store pages
export async function generateMerchantMetadata(
    merchantId: string,
    locale = 'en'
): Promise<Metadata> {
    // Add validation for merchantId
    if (!merchantId) {
        return {
            ...baseMetadata,
            title: 'Store - Yetu Delivery',
        };
    }

    try {
        const merchant = await prisma.merchant.findUnique({
            where: { id: merchantId },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        if (!merchant) {
            return {
                ...baseMetadata,
                title: 'Store Not Found',
            };
        }

        const title = locale === 'en'
            ? `${merchant.businessName} - Order Online | Yetu Delivery`
            : `${merchant.businessName} - Agiza Mtandaoni | Yetu Delivery`;

        const description = locale === 'en'
            ? `Order from ${merchant.businessName}. ${merchant._count.products} products available for fast delivery.`
            : `Agiza kutoka ${merchant.businessName}. Bidhaa ${merchant._count.products} zinapatikana kwa uwasilishaji wa haraka.`;

        return {
            ...baseMetadata,
            title,
            description,
            keywords: [
                ...baseMetadata.keywords,
                merchant.businessName,
                merchant.merchantType,
                'local store',
                'delivery',
            ],
            openGraph: {
                ...baseMetadata.openGraph,
                title,
                description,
                url: `/stores/${merchant.slug}`,
                images: merchant.bannerUrl ? [
                    {
                        url: merchant.bannerUrl,
                        width: 1200,
                        height: 630,
                        alt: merchant.businessName,
                    },
                ] : baseMetadata.openGraph.images,
                type: 'website',
            },
            twitter: {
                ...baseMetadata.twitter,
                title,
                description,
                images: merchant.bannerUrl ? [merchant.bannerUrl] : baseMetadata.twitter.images,
            },
        };
    } catch (error) {
        console.error({ message: 'Error generating merchant metadata:', error });
        return {
            ...baseMetadata,
            title: 'Store - Yetu Delivery',
        };
    }
}

// Generate metadata for category pages
export async function generateCategoryMetadata(
    categoryId: string,
    locale = 'en'
): Promise<Metadata> {
    try {
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        if (!category) {
            return {
                ...baseMetadata,
                title: 'Category Not Found',
            };
        }

        const title = locale === 'en'
            ? `${category.name} - Shop Online | Yetu Delivery`
            : `${category.name} - Duka Mtandaoni | Yetu Delivery`;

        const description = locale === 'en'
            ? `Shop ${category.name} products. ${category._count.products} items available for fast delivery. ${category.description || ''}`
            : `Duka bidhaa za ${category.name}. Vitu ${category._count.products} vinapatikana kwa uwasilishaji wa haraka. ${category.description || ''}`;

        return {
            ...baseMetadata,
            title,
            description,
            keywords: [
                ...baseMetadata.keywords,
                category.name,
                'category',
                'products',
            ],
            openGraph: {
                ...baseMetadata.openGraph,
                title,
                description,
                url: `/categories/${category.slug}`,
                type: 'website',
            },
            twitter: {
                ...baseMetadata.twitter,
                title,
                description,
            },
        };
    } catch (error) {
        console.error({ message: 'Error generating category metadata:', error });
        return {
            ...baseMetadata,
            title: 'Category - Yetu Delivery',
        };
    }
}

// Generate structured data (JSON-LD)
export function generateOrganizationStructuredData() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Yetu Delivery',
        url: process.env.NEXT_PUBLIC_APP_URL,
        logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
        description: 'Fast and fresh grocery delivery service',
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'KE',
            addressLocality: 'Nairobi',
        },
        sameAs: [
            'https://facebook.com/Yetudelivery',
            'https://twitter.com/Yetudelivery',
            'https://instagram.com/Yetudelivery',
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+254-700-000000',
            contactType: 'customer service',
        },
    };
}

export function generateProductStructuredData(product: any) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description: product.description,
        image: product.images?.map((img: any) => img.url) || [],
        brand: {
            '@type': 'Brand',
            name: product.merchant?.businessName,
        },
        offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'USD',
            availability: product.visibility ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`,
        },
        aggregateRating: product.rating ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
        } : undefined,
    };
}

export function generateLocalBusinessStructuredData(merchant: Merchant) {
    return {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: merchant.businessName,
        image: merchant.bannerUrl,
        description: `Order from ${merchant.businessName} for fast delivery`,
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'KE',
            addressLocality: 'Nairobi',
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: merchant.address.latitude,
            longitude: merchant.address.longitude,
        },
        openingHours: 'Mo-Su 08:00-22:00',
        priceRange: '$$',
        telephone: merchant.phone,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/stores/${merchant.slug}`,
    };
}

// Generate sitemap data
export async function generateSitemapData() {
    try {
        const [products, merchants, categories] = await Promise.all([
            prisma.product.findMany({
                where: { visibility: true, status: 'VERIFIED' },
                select: { slug: true, updatedAt: true },
            }),
            prisma.merchant.findMany({
                where: { isVerified: true },
                select: { slug: true, updatedAt: true },
            }),
            prisma.category.findMany({
                select: { slug: true, updatedAt: true },
            }),
        ]);

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

        return {
            products: products.map(product => ({
                url: `${baseUrl}/products/${product.slug}`,
                lastModified: product.updatedAt,
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            })),
            merchants: merchants.map(merchant => ({
                url: `${baseUrl}/stores/${merchant.slug}`,
                lastModified: merchant.updatedAt,
                changeFrequency: 'monthly' as const,
                priority: 0.9,
            })),
            categories: categories.map(category => ({
                url: `${baseUrl}/categories/${category.slug}`,
                lastModified: category.updatedAt,
                changeFrequency: 'monthly' as const,
                priority: 0.7,
            })),
        };
    } catch (error) {
        console.error({ message: 'Error generating sitemap data:', error });
        return { products: [], merchants: [], categories: [] };
    }
}