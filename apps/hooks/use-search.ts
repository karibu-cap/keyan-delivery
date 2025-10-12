import { ICategory, fetchCategories, fetchMerchants } from '@/lib/actions/client/stores';
import { IMerchant, IProduct } from '@/lib/actions/stores';
import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from './use-debounce';

interface SearchResult {
    id: string;
    title: string;
    type: 'product' | 'merchant' | 'category';
    image?: string;
    price?: number;
    merchant?: string;
    category?: string;
}

interface UseSearchReturn {
    query: string;
    setQuery: (query: string) => void;
    results: SearchResult[];
    isLoading: boolean;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    clearResults: () => void;
}

export const useSearch = (): UseSearchReturn => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const debouncedQuery = useDebounce(query, 300);

    const searchProducts = useCallback(async (searchQuery: string): Promise<SearchResult[]> => {
        try {
            const response = await fetch(`/api/v1/client/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
            if (!response.ok) throw new Error('Search failed');

            const data = await response.json();
            if (!data.success) throw new Error('Search failed');

            return data.data.products.map((product: IProduct) => ({
                id: product.id,
                title: product.title,
                type: 'product' as const,
                image: product.images[0].url,
                price: product.price,
                merchant: product.merchant.businessName,
            }));
        } catch (error) {
            console.error('Product search error:', error);
            return [];
        }
    }, []);

    const searchMerchants = useCallback(async (searchQuery: string): Promise<SearchResult[]> => {
        try {
            const response = await fetchMerchants({
                search: searchQuery,
                limit: 5,
                offset: 0
            });
            if (!response.merchants.length) return [];

            return response.merchants.map((merchant: IMerchant) => ({
                id: merchant.id,
                title: merchant.businessName,
                type: 'merchant' as const,
                image: merchant.logoUrl ?? merchant.bannerUrl ?? '',
                merchant: merchant.businessName,
            }));
        } catch (error) {
            console.error('Merchant search error:', error);
            return [];
        }
    }, []);

    const searchCategories = useCallback(async (searchQuery: string): Promise<SearchResult[]> => {
        try {
            const response = await fetchCategories({
                search: searchQuery,
                limit: 5,
                offset: 0
            });
            if (!response.categories.length) return [];

            return response.categories.map((category: ICategory) => ({
                id: category.id,
                title: category.name,
                type: 'category' as const,
                category: category.name,
            }));
        } catch (error) {
            console.error('Category search error:', error);
            return [];
        }
    }, []);

    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        const performSearch = async () => {
            setIsLoading(true);

            try {
                const [productResults, merchantResults, categoryResults] = await Promise.all([
                    searchProducts(debouncedQuery),
                    searchMerchants(debouncedQuery),
                    searchCategories(debouncedQuery),
                ]);

                const allResults = [
                    ...productResults,
                    ...merchantResults,
                    ...categoryResults,
                ].slice(0, 8);

                setResults(allResults);
                setIsOpen(allResults.length > 0);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        performSearch();
    }, [debouncedQuery, searchProducts, searchMerchants, searchCategories]);

    const clearResults = useCallback(() => {
        setResults([]);
        setIsOpen(false);
        setQuery('');
    }, []);

    return {
        query,
        setQuery,
        results,
        isLoading,
        isOpen,
        setIsOpen,
        clearResults,
    };
};