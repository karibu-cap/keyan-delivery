"use server";

import { Prisma } from "@prisma/client";
export type IProduct = Prisma.ProductGetPayload<{
  include: {
    categories: {
      include: {
        category: true
      }
    }
    media: true
    merchant: true
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
        media: true
        merchant: true
      }
    };
    managers: true;
    categories: true;
  };
}>  ;

interface SeoMetadata {
  seoTitle?: string;
  seoDescription?: string;
  keywords: string[];
}

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
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

export async function fetchMerchants(
  search?: string,
  category?: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ merchants: IMerchant[]; pagination: PaginationInfo }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await fetch(
      `${baseUrl}/api/merchants?${params.toString()}`,
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

export async function fetchCategories(): Promise<{ categories: Category[] }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/categories`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch categories');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
}

export async function searchStores(searchQuery: string): Promise<IMerchant[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/merchants?search=${encodeURIComponent(searchQuery)}`,
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
      `${baseUrl}/api/merchants?category=${encodeURIComponent(categoryId)}`,
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