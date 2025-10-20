// Comprehensive caching system for Next.js application
import { unstable_cache } from 'next/cache';

// Cache TTL configurations
export const CACHE_TTL = {
    // Static content - long cache
    STATIC: 60 * 60 * 24 * 7, // 7 days

    // Dynamic content - medium cache
    DYNAMIC: 60 * 60 * 1, // 1 hour

    // Real-time content - short cache
    REALTIME: 60 * 5, // 5 minutes

    // Product data - medium with revalidation
    PRODUCTS: 60 * 60 * 2, // 2 hours

    // User-specific data - very short cache
    USER: 60 * 1, // 1 minute
} as const;

// Cache tags for selective revalidation
export const CACHE_TAGS = {
    PRODUCTS: 'products',
    MERCHANTS: 'merchants',
    CATEGORIES: 'categories',
    ORDERS: 'orders',
    USERS: 'users',
    CART: 'cart',
    SEARCH: 'search',
} as const;

// Generic cache wrapper
export function createCache<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    key: string,
    ttl: number = CACHE_TTL.DYNAMIC,
    tags: string[] = []
) {
    return unstable_cache(fn, [key], {
        revalidate: ttl,
        tags,
    });
}

// Product-related cache functions
export const getCachedProducts = createCache(
    async (filters: {
        merchantId?: string;
        categoryId?: string;
        search?: string;
        merchantType?: string;
        limit?: number;
        offset?: number;
    }) => {
        const { prisma } = await import('@/lib/prisma');

        const where: Record<string, unknown> = {
            visibility: true,
            status: 'VERIFIED'
        };

        if (filters.merchantId) {
            where.merchantId = filters.merchantId;
        }

        if (filters.merchantType) {
            where.merchant = {
                merchantType: filters.merchantType
            };
        }

        if (filters.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } }
            ];
        }

        if (filters.categoryId) {
            where.categories = {
                some: {
                    categoryId: filters.categoryId
                }
            };
        }

        return prisma.product.findMany({
            where,
            include: {
                images: true,
                categories: {
                    include: {
                        category: true
                    }
                },
                merchant: true,
                promotions: true
            },
            orderBy: [{ createdAt: 'desc' }],
            take: filters.limit || 20,
            skip: filters.offset || 0
        });
    },
    'products',
    CACHE_TTL.PRODUCTS,
    [CACHE_TAGS.PRODUCTS]
);

export const getCachedProductCount = createCache(
    async (filters: {
        merchantId?: string;
        categoryId?: string;
        search?: string;
        merchantType?: string;
    }) => {
        const { prisma } = await import('@/lib/prisma');

        const where: Record<string, unknown> = {
            visibility: true,
            status: 'VERIFIED'
        };

        if (filters.merchantId) {
            where.merchantId = filters.merchantId;
        }

        if (filters.merchantType) {
            where.merchant = {
                merchantType: filters.merchantType
            };
        }

        if (filters.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } }
            ];
        }

        if (filters.categoryId) {
            where.categories = {
                some: {
                    categoryId: filters.categoryId
                }
            };
        }

        return prisma.product.count({ where });
    },
    'product-count',
    CACHE_TTL.PRODUCTS,
    [CACHE_TAGS.PRODUCTS]
);

// Merchant-related cache functions
export const getCachedMerchants = createCache(
    async (filters: {
        merchantType?: string;
        search?: string;
        limit?: number;
        offset?: number;
    }) => {
        const { prisma } = await import('@/lib/prisma');

        const where: Record<string, unknown> = {
            isVerified: true
        };

        if (filters.merchantType) {
            where.merchantType = filters.merchantType;
        }

        if (filters.search) {
            where.businessName = {
                contains: filters.search,
                mode: 'insensitive'
            };
        }

        return prisma.merchant.findMany({
            where,
            orderBy: [{ createdAt: 'desc' }],
            take: filters.limit || 20,
            skip: filters.offset || 0
        });
    },
    'merchants',
    CACHE_TTL.DYNAMIC,
    [CACHE_TAGS.MERCHANTS]
);

// Category-related cache functions
export const getCachedCategories = createCache(
    async () => {
        const { prisma } = await import('@/lib/prisma');

        return prisma.category.findMany({
            orderBy: [{ name: 'asc' }],
        });
    },
    'categories',
    CACHE_TTL.DYNAMIC,
    [CACHE_TAGS.CATEGORIES]
);

// Search cache functions
export const getCachedSearchResults = createCache(
    async (query: string, filters: {
        categoryId?: string;
        merchantId?: string;
        limit?: number;
    }) => {
        const { prisma } = await import('@/lib/prisma');

        const where: Record<string, unknown> = {
            visibility: true,
            status: 'VERIFIED',
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
            ]
        };

        if (filters.categoryId) {
            where.categories = {
                some: {
                    categoryId: filters.categoryId
                }
            };
        }

        if (filters.merchantId) {
            where.merchantId = filters.merchantId;
        }

        return prisma.product.findMany({
            where,
            include: {
                images: true,
                merchant: true,
                categories: {
                    include: {
                        category: true
                    }
                }
            },
            orderBy: [
                { title: 'asc' }
            ],
            take: filters.limit || 50
        });
    },
    'search-results',
    CACHE_TTL.REALTIME,
    [CACHE_TAGS.SEARCH]
);


// Cache invalidation helpers
export async function invalidateCache(tags: string[]) {
    // In Next.js App Router, we need to revalidate paths or use tags
    // This is a placeholder for cache invalidation logic
    console.info('Invalidating cache for tags:', tags);
}

export async function invalidateProductCache() {
    await invalidateCache([CACHE_TAGS.PRODUCTS]);
}

export async function invalidateMerchantCache() {
    await invalidateCache([CACHE_TAGS.MERCHANTS]);
}

export async function invalidateCartCache() {
    await invalidateCache([CACHE_TAGS.CART]);
}

// Memory cache for frequently accessed data
const memoryCache = new Map<string, { data: any; expiry: number }>();

export function setMemoryCache<T>(key: string, data: T, ttl: number = CACHE_TTL.REALTIME): void {
    memoryCache.set(key, {
        data,
        expiry: Date.now() + (ttl * 1000)
    });
}

export function getMemoryCache<T>(key: string): T | null {
    const cached = memoryCache.get(key);

    if (!cached) {
        return null;
    }

    if (Date.now() > cached.expiry) {
        memoryCache.delete(key);
        return null;
    }

    return cached.data as T;
}

export function clearMemoryCache(): void {
    memoryCache.clear();
}

// Edge cache configuration for Vercel
export const edgeCacheConfig = {
    // Cache static assets at edge
    staticAssets: {
        maxAge: CACHE_TTL.STATIC,
        staleWhileRevalidate: CACHE_TTL.DYNAMIC,
    },

    // Cache API responses at edge
    apiResponses: {
        maxAge: CACHE_TTL.DYNAMIC,
        staleWhileRevalidate: CACHE_TTL.REALTIME,
    },

    // Cache HTML pages at edge
    htmlPages: {
        maxAge: CACHE_TTL.REALTIME,
        staleWhileRevalidate: 60, // 1 minute
    },
};

// Database query optimization
export async function getOptimizedProducts(filters: {
    merchantId?: string;
    categoryId?: string;
    search?: string;
    merchantType?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'price' | 'rating' | 'newest' | 'popular';
    sortOrder?: 'asc' | 'desc';
}) {
    const { prisma } = await import('@/lib/prisma');

    const where: Record<string, unknown> = {
        visibility: true,
        status: 'VERIFIED'
    };

    if (filters.merchantId) {
        where.merchantId = filters.merchantId;
    }

    if (filters.merchantType) {
        where.merchant = {
            merchantType: filters.merchantType
        };
    }

    if (filters.search) {
        where.OR = [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } }
        ];
    }

    if (filters.categoryId) {
        where.categories = {
            some: {
                categoryId: filters.categoryId
            }
        };
    }

    // Optimized order by clause
    const orderBy = (() => {
        switch (filters.sortBy) {
            case 'price':
                return [{ price: filters.sortOrder || 'asc' }];
            case 'rating':
                return [{ rating: filters.sortOrder || 'desc' }];
            case 'popular':
                return [{ reviewCount: filters.sortOrder || 'desc' }];
            case 'newest':
            default:
                return [{ createdAt: filters.sortOrder || 'desc' }];
        }
    })();

    return prisma.product.findMany({
        where,
        include: {
            images: true,
            merchant: true,
            categories: {
                include: {
                    category: true
                }
            }
        },
        orderBy,
        take: filters.limit || 20,
        skip: filters.offset || 0
    });
}