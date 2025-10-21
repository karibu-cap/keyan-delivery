"use client";

import { OptimizedImage } from '@/components/ClsOptimization';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { useT } from '@/hooks/use-inline-translation';
import { cn } from '@/lib/utils';
import { Clock, Filter, Search, TrendingUp, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

// Types
interface SearchFilters {
    category?: string;
    merchant?: string;
    priceRange?: [number, number];
    rating?: number;
    inStock?: boolean;
    sortBy?: 'relevance' | 'price' | 'rating' | 'newest' | 'popular';
    sortOrder?: 'asc' | 'desc';
}

interface SearchResult {
    id: string;
    title: string;
    price: number;
    rating?: number;
    reviewCount?: number;
    image: string;
    merchant: string;
    category: string;
    inStock: boolean;
    badge?: string;
}

interface SearchWithTypeaheadProps {
    onSearch?: (query: string, filters: SearchFilters) => void;
    onResultSelect?: (result: SearchResult) => void;
    placeholder?: string;
    className?: string;
    showFilters?: boolean;
    categories?: Array<{ id: string; name: string }>;
    merchants?: Array<{ id: string; name: string }>;
}

// Search history hook
function useSearchHistory(maxItems: number = 10) {
    const [history, setHistory] = useState<string[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('search-history');
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse search history:', e);
            }
        }
    }, []);

    const addToHistory = useCallback((query: string) => {
        if (!query.trim()) return;

        setHistory(prev => {
            const filtered = prev.filter(item => item !== query);
            const updated = [query, ...filtered].slice(0, maxItems);
            localStorage.setItem('search-history', JSON.stringify(updated));
            return updated;
        });
    }, [maxItems]);

    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem('search-history');
    }, []);

    const removeFromHistory = useCallback((query: string) => {
        setHistory(prev => {
            const updated = prev.filter(item => item !== query);
            localStorage.setItem('search-history', JSON.stringify(updated));
            return updated;
        });
    }, []);

    return { history, addToHistory, clearHistory, removeFromHistory };
}

// Popular searches (could be fetched from API)
const POPULAR_SEARCHES = [
    'fresh vegetables',
    'organic fruits',
    'dairy products',
    'bakery items',
    'meat & poultry',
    'beverages',
    'snacks',
    'personal care'
];

export function SearchWithTypeahead({
    onSearch,
    onResultSelect,
    placeholder = "Search for products...",
    className,
    showFilters = true,
    categories = [],
    merchants = []
}: SearchWithTypeaheadProps) {
    const t = useT();
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState<SearchFilters>({});
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [recentResults, setRecentResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const debouncedQuery = useDebounce(query, 300);
    const { history, addToHistory, clearHistory, removeFromHistory } = useSearchHistory();

    // Simulate search results (replace with actual API call)
    const searchResults = useMemo(() => {
        if (!debouncedQuery || debouncedQuery.length < 2) {
            return [];
        }

        // This would normally be an API call
        return recentResults.filter(result =>
            result.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            result.merchant.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            result.category.toLowerCase().includes(debouncedQuery.toLowerCase())
        );
    }, [debouncedQuery, recentResults]);

    // Handle search input
    const handleSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) return;

        setHasSearched(true);
        setIsOpen(true);
        setIsLoading(true);
        addToHistory(searchQuery);

        try {
            const params = new URLSearchParams({
                q: searchQuery,
                engine: 'hybrid',
                limit: '20',
            });
            if (selectedFilters.category) params.set('categoryId', String(selectedFilters.category));
            if (selectedFilters.merchant) params.set('merchantId', String(selectedFilters.merchant));

            const response = await fetch(`/api/v1/client/search?${params.toString()}`);
            const data = await response.json();
            if (data.success && Array.isArray(data.results)) {
                const mapped: SearchResult[] = data.results.map((r: any) => ({
                    id: r.id,
                    title: r.title,
                    price: r.price ?? r.product?.price ?? 0,
                    rating: r.product?.rating,
                    reviewCount: r.product?.reviewCount,
                    image: r.image || r.product?.images?.[0]?.url || '',
                    merchant: r.product?.merchant?.businessName || r.merchant?.businessName || r.merchant?.name || r.store?.name || r.storeName || r.merchantName || '',
                    category: r.category || r.product?.categories?.[0]?.category?.name || '',
                    inStock: true,
                    badge: undefined,
                }));

                setRecentResults(mapped);
                onSearch?.(searchQuery, selectedFilters);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedFilters, addToHistory, onSearch]);

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setIsOpen(false);
        setHasSearched(false);
    };

    // Handle result selection
    const handleResultSelect = (result: SearchResult) => {
        setQuery(result.title);
        setIsOpen(false);
        onResultSelect?.(result);
    };

    // Handle filter changes
    const updateFilter = (key: keyof SearchFilters, value: any) => {
        setSelectedFilters(prev => {
            const updated = { ...prev };
            if (value === null || value === undefined || value === '') {
                delete updated[key];
            } else {
                updated[key] = value;
            }
            return updated;
        });
    };

    // Clear all filters
    const clearFilters = () => {
        setSelectedFilters({});
    };

    // Apply filters and search
    const applyFiltersAndSearch = () => {
        if (debouncedQuery) {
            handleSearch(debouncedQuery);
        }
        setShowFilterPanel(false);
    };

    // Active filter count
    const activeFilterCount = Object.keys(selectedFilters).length;

    return (
        <ErrorBoundary>
            <div className={cn("relative w-full", className)}>
                {/* Search Input */}
                <div className="relative flex items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder={placeholder}
                            value={query}
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    setHasSearched(true);
                                    setIsOpen(true);
                                    handleSearch(query);
                                }
                            }}
                            className="pl-10 pr-12"
                        />

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            </div>
                        )}

                        {/* Clear button */}
                        {!isLoading && query && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setQuery('');
                                    setIsOpen(false);
                                }}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        )}
                    </div>

                    {/* Filter toggle */}
                    {showFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilterPanel(!showFilterPanel)}
                            className="ml-2 relative"
                        >
                            <Filter className="w-4 h-4" />
                            {activeFilterCount > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                                >
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    )}
                </div>

                {/* Search Results Dropdown */}
                {isOpen && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-hidden">
                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="max-h-48 overflow-y-auto">
                                {searchResults.slice(0, 8).map((result) => (
                                    <div
                                        key={result.id}
                                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                        onClick={() => handleResultSelect(result)}
                                    >
                                        <OptimizedImage
                                            src={result.image}
                                            alt={result.title}
                                            width={40}
                                            height={40}
                                            className="w-10 h-10 object-cover rounded-md mr-3"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {result.title}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {[result.merchant, result.category].filter(Boolean).join(' • ')}
                                            </p>
                                            <div className="flex items-center mt-1">
                                                <span className="text-sm font-semibold text-primary">
                                                    {t.formatAmount(result.price)}
                                                </span>
                                                {result.rating && (
                                                    <div className="flex items-center ml-2">
                                                        <span className="text-xs text-gray-500">
                                                            ★ {result.rating}
                                                        </span>
                                                        {result.reviewCount && (
                                                            <span className="text-xs text-gray-400 ml-1">
                                                                ({result.reviewCount})
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {result.badge && (
                                            <Badge variant="secondary" className="ml-2 text-xs">
                                                {result.badge}
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Search History */}
                        {searchResults.length === 0 && history.length > 0 && query.length < 2 && (
                            <div>
                                <div className="px-3 py-2 text-xs font-medium text-gray-500 flex items-center">
                                    <Clock className="w-3 h-3 mr-2" />
                                    Recent searches
                                </div>
                                {history.slice(0, 5).map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                        onClick={() => {
                                            setQuery(item);
                                            handleSearch(item);
                                        }}
                                    >
                                        <span className="text-sm text-gray-700">{item}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFromHistory(item);
                                            }}
                                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Popular Searches */}
                        {searchResults.length === 0 && history.length === 0 && query.length < 2 && (
                            <div>
                                <div className="px-3 py-2 text-xs font-medium text-gray-500 flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-2" />
                                    Popular searches
                                </div>
                                <div className="px-3 pb-2 flex flex-wrap gap-2">
                                    {POPULAR_SEARCHES.map((item) => (
                                        <Badge
                                            key={item}
                                            variant="outline"
                                            className="cursor-pointer hover:bg-gray-100 text-xs"
                                            onClick={() => {
                                                setQuery(item);
                                                handleSearch(item);
                                            }}
                                        >
                                            {item}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No results */}
                        {hasSearched && searchResults.length === 0 && !isLoading && (
                            <div className="px-3 py-8 text-center text-sm text-gray-500">
                                No products found for &quot;{query}&quot;
                            </div>
                        )}
                    </div>
                )}

                {/* Filter Panel */}
                {showFilterPanel && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-md shadow-lg p-4">
                        <div className="space-y-4">
                            {/* Category Filter */}
                            {categories.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                        value={selectedFilters.category || ''}
                                        onChange={(e) => updateFilter('category', e.target.value)}
                                    >
                                        <option value="">All categories</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Merchant Filter */}
                            {merchants.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Store
                                    </label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                        value={selectedFilters.merchant || ''}
                                        onChange={(e) => updateFilter('merchant', e.target.value)}
                                    >
                                        <option value="">All stores</option>
                                        {merchants.map((merchant) => (
                                            <option key={merchant.id} value={merchant.id}>
                                                {merchant.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Sort Options */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sort by
                                </label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                    value={`${selectedFilters.sortBy || 'relevance'}-${selectedFilters.sortOrder || 'desc'}`}
                                    onChange={(e) => {
                                        const [sortBy, sortOrder] = e.target.value.split('-');
                                        updateFilter('sortBy', sortBy as any);
                                        updateFilter('sortOrder', sortOrder as any);
                                    }}
                                >
                                    <option value="relevance-desc">Relevance</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                    <option value="rating-desc">Highest Rated</option>
                                    <option value="newest-desc">Newest First</option>
                                    <option value="popular-desc">Most Popular</option>
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                                <Button
                                    size="sm"
                                    onClick={applyFiltersAndSearch}
                                    className="flex-1"
                                >
                                    Apply Filters
                                </Button>
                                {activeFilterCount > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearFilters}
                                    >
                                        Clear ({activeFilterCount})
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Filters Display */}
                {activeFilterCount > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {selectedFilters.category && (
                            <Badge variant="secondary" className="text-xs">
                                Category: {categories.find(c => c.id === selectedFilters.category)?.name}
                                <X
                                    className="w-3 h-3 ml-1 cursor-pointer"
                                    onClick={() => updateFilter('category', null)}
                                />
                            </Badge>
                        )}
                        {selectedFilters.merchant && (
                            <Badge variant="secondary" className="text-xs">
                                Store: {merchants.find(m => m.id === selectedFilters.merchant)?.name}
                                <X
                                    className="w-3 h-3 ml-1 cursor-pointer"
                                    onClick={() => updateFilter('merchant', null)}
                                />
                            </Badge>
                        )}
                        {selectedFilters.sortBy && (
                            <Badge variant="secondary" className="text-xs">
                                Sort: {selectedFilters.sortBy} {selectedFilters.sortOrder}
                                <X
                                    className="w-3 h-3 ml-1 cursor-pointer"
                                    onClick={() => {
                                        updateFilter('sortBy', null);
                                        updateFilter('sortOrder', null);
                                    }}
                                />
                            </Badge>
                        )}
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
}