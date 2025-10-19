import { prisma } from '@/lib/prisma';
import { Prisma, ProductStatus } from "@prisma/client";
import { cache } from 'react';


export const MerchantIncludes = {
  // For store listings (minimal data)
  list: {
    _count: {
      select: { products: true }
    }
  },

  storeDataById: {
    products: {
      where: {
        status: ProductStatus.VERIFIED,
        visibility: true,
      },
      include: {
        images: true,
        categories: {
          include: {
            category: true,
          },
        },
        merchant: true,
        _count: {
          select: {
            OrderItem: true,
            cartItems: true,
          },
        }
      },
    },
  }

} as const;

// 2. Generate types
export type IMerchantList = Prisma.MerchantGetPayload<{
  include: typeof MerchantIncludes.list;
}>;

export type IMerchantDetail = Prisma.MerchantGetPayload<{
  include: typeof MerchantIncludes.storeDataById;
}>;



export type IProduct = Prisma.ProductGetPayload<{
  include: {
    categories: {
      include: {
        category: true
      }
    }
    images: true
    merchant: true
    _count: {
      select: {
        OrderItem: true,
        cartItems: true,
      },
    },
  }

}>
export type IMerchant = Prisma.MerchantGetPayload<{
  include: {
    products: {
      include: {
        categories: {
          include: {
            category: true
          }
        }
        images: true
        merchant: true
        _count: {
          select: {
            OrderItem: true,
            cartItems: true,
          },
        },
      }
    };
    managers: true;
  };
}>;



export interface Aisle {
  id: string;
  name: string;
  count: number;
}





export async function searchStores(searchQuery: string): Promise<IMerchant[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    const response = await fetch(
      `${baseUrl}/api/v1/client/merchants?search=${encodeURIComponent(searchQuery)}`,
      {
        next: { revalidate: 300 }, // Revalidate every 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search stores');
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to search stores');
    }

    return data.data.merchants;
  } catch (error) {
    console.error('Error searching stores:', error);
    throw new Error('Failed to search stores');
  }
}

export async function filterStoresByCategory(categoryId: string): Promise<IMerchant[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    const response = await fetch(
      `${baseUrl}/api/v1/client/merchants?category=${encodeURIComponent(categoryId)}`,
      {
        next: { revalidate: 300 }, // Revalidate every 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error('Failed to filter stores');
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to filter stores');
    }

    return data.data.merchants;
  } catch (error) {
    console.error('Error filtering stores:', error);
    throw new Error('Failed to filter stores');
  }
}

export async function fetchProduct(slug: string): Promise<IProduct | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    const response = await fetch(
      `${baseUrl}/api/v1/client/products/${slug}`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.success) {
      return null;
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error('Failed to fetch product');
  }
}

export const fetchRelatedProducts = cache(async (slug: string, categoryIds: string[], merchantId: string): Promise<IProduct[]> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    const response = await fetch(
      `${baseUrl}/api/v1/client/products/${slug}/related`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryIds, merchantId }),
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!data.success) {
      return [];
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching related products:', error);
    throw new Error('Failed to fetch related products');
  }
});

export const fetchStoreDataBySlug = cache(async (slug: string): Promise<{
  merchant: IMerchantDetail;
  aisles: Aisle[];
} | null> => {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: {
        slug: slug,
        isVerified: true,
      },
      include: MerchantIncludes.storeDataById,
    });

    if (!merchant) {
      return null;
    }

    // Generate aisles from categories
    const categories: Record<string, Aisle> = {}
    merchant.products.flatMap((product) => product.categories).forEach((category) => {
      categories[category.category.id] = {
        id: category.category.id,
        name: category.category.name,
        count: merchant.products.filter((product) =>
          product.categories.some((c) => c.categoryId === category.category.id)
        ).length,
      }
    })
    const aisles = Object.values(categories)

    return {
      merchant: merchant,
      aisles,
    };
  } catch (error) {
    console.error('Error fetching store data:', error);
    return null;
  }
})


interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export async function fetchMerchants({
  search,
  limit = 20,
  offset = 0
}: {
  search?: string;
  limit: number;
  offset: number;
}): Promise<{ merchants: IMerchant[]; pagination: PaginationInfo }> {
  try {
    const whereClause: Prisma.MerchantWhereInput = {
      isVerified: true,
    };

    if (search) {
      whereClause.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const merchants = await prisma.merchant.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        products: {
          where: {
            status: ProductStatus.VERIFIED,
            visibility: true,
          },
          include: {
            categories: {
              include: {
                category: true
              }
            },
            images: true,
            merchant: true,
            _count: {
              select: {
                OrderItem: true,
                cartItems: true,
              },
            },
          },
        },
        managers: {
          include: {
            user: {
              select: { fullName: true, phone: true }
            }
          }
        }
      }
    });

    const totalCount = await prisma.merchant.count({ where: whereClause });

    return {
      merchants: merchants,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      }
    };
  } catch (error) {
    console.error('Error fetching merchants:', error);
    throw new Error('Failed to fetch merchants');
  }
}
