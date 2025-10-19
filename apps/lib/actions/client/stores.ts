import { IMerchant } from "../server/stores";

interface PaginationInfo {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}


interface SeoMetadata {
    seoTitle?: string;
    seoDescription?: string;
    keywords: string[];
}

export interface ICategory {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    productCount: number;
    image?: string | null;
    seoMetadata?: SeoMetadata | null;
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
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        params.append('limit', limit.toString());
        params.append('offset', offset.toString());

        const response = await fetch(
            `/api/v1/client/merchants?${params.toString()}`,
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
}): Promise<{ categories: ICategory[] }> {

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    try {
        const response = await fetch(
            `${baseUrl}/api/v1/client/categories?${params.toString()}`,
            {
                next: { revalidate: 300 }, // Revalidate every 5 minutes
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
