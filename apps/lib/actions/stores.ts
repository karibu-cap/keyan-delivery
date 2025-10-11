"use server";

import { prisma } from '@/lib/prisma';
import { Prisma } from "@prisma/client";

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
    categories: true;
  };
}>;

interface SeoMetadata {
  seoTitle?: string;
  seoDescription?: string;
  keywords: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  productCount: number;
  image?: string | null;
  seoMetadata?: SeoMetadata | null;
}


export interface Aisle {
  id: string;
  name: string;
  count: number;
}




export async function fetchCategories({
  search,
  category,
  limit = 20,
  offset = 0
}: {
  search?: string;
  category?: string;
  limit: number;
  offset: number;
}): Promise<{ categories: Category[] }> {

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category) params.append('category', category);
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());
  try {
    const response = await fetch(
      `${baseUrl}/api/v1/client/categories?${params.toString()}`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return { categories: [] };
    }

    const data = await response.json();

    if (!data.success) {
      return { categories: [] };
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { categories: [] };
  }
}

export async function searchStores(searchQuery: string): Promise<IMerchant[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/v1/client/merchants?search=${encodeURIComponent(searchQuery)}`,
      {
        cache: 'no-store',
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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/v1/client/merchants?category=${encodeURIComponent(categoryId)}`,
      {
        cache: 'no-store',
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

export async function fetchProduct(productId: string): Promise<IProduct | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/v1/client/products/${productId}`,
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


export async function fetchStoreDataById(id: string): Promise<{
  merchant: Record<string, unknown>;
  aisles: Aisle[];
} | null> {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: {
        id: id,
        isVerified: true,
      },
      include: {
        products: {
          where: {
            status: 'VERIFIED',
            visibility: true,
          },
          include: {
            images: true,
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
        categories: {
          select: {
            category: true,
          },
        },
      },
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
}


interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export async function fetchMerchants({
  search,
  category,
  limit = 20,
  offset = 0
}: {
  search?: string;
  category?: string;
  limit: number;
  offset: number;
}): Promise<{ merchants: IMerchant[]; pagination: PaginationInfo }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await fetch(
      `${baseUrl}/api/v1/client/merchants?${params.toString()}`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch merchants');
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch merchants');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching merchants:', error);
    throw new Error('Failed to fetch merchants');
  }
}
