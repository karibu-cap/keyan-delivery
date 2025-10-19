// Streaming and progressive loading components using React Suspense
import React, { Suspense } from 'react';
import { LoadingSpinner, SectionLoading, ProductGridSkeleton, MerchantCardSkeleton, FormSkeleton } from './loading-states';

// Generic streaming wrapper
interface StreamingWrapperProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    errorFallback?: React.ReactNode;
}

export const StreamingWrapper: React.FC<StreamingWrapperProps> = ({
    children,
    fallback,
    errorFallback,
}) => {
    return (
        <Suspense
            fallback={fallback || <SectionLoading />}
        >
            {children}
        </Suspense>
    );
};

// Product grid with progressive loading
interface ProductGridStreamingProps {
    productsPromise: Promise<any[]>;
    renderProduct: (product: any) => React.ReactNode;
    className?: string;
}

export const ProductGridStreaming: React.FC<ProductGridStreamingProps> = ({
    productsPromise,
    renderProduct,
    className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4',
}) => {
    return (
        <StreamingWrapper
            fallback={<div className={className}><ProductGridSkeleton count={8} /></div>}
        >
            <ProductGridContent
                productsPromise={productsPromise}
                renderProduct={renderProduct}
                className={className}
            />
        </StreamingWrapper>
    );
};

// Internal component that handles the promise
const ProductGridContent: React.FC<ProductGridStreamingProps> = async ({
    productsPromise,
    renderProduct,
    className,
}) => {
    const products = await productsPromise;

    return (
        <div className={className}>
            {products.map((product) => renderProduct(product))}
        </div>
    );
};

// Merchant list with progressive loading
interface MerchantListStreamingProps {
    merchantsPromise: Promise<any[]>;
    renderMerchant: (merchant: any) => React.ReactNode;
    className?: string;
}

export const MerchantListStreaming: React.FC<MerchantListStreamingProps> = ({
    merchantsPromise,
    renderMerchant,
    className = 'space-y-4',
}) => {
    return (
        <StreamingWrapper
            fallback={
                <div className={className}>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <MerchantCardSkeleton key={index} />
                    ))}
                </div>
            }
        >
            <MerchantListContent
                merchantsPromise={merchantsPromise}
                renderMerchant={renderMerchant}
                className={className}
            />
        </StreamingWrapper>
    );
};

// Internal component for merchant list
const MerchantListContent: React.FC<MerchantListStreamingProps> = async ({
    merchantsPromise,
    renderMerchant,
    className,
}) => {
    const merchants = await merchantsPromise;

    return (
        <div className={className}>
            {merchants.map((merchant) => renderMerchant(merchant))}
        </div>
    );
};

// Order timeline with progressive loading
interface OrderTimelineStreamingProps {
    orderId: string;
    timelinePromise: Promise<any[]>;
    renderTimelineItem: (item: any) => React.ReactNode;
}

export const OrderTimelineStreaming: React.FC<OrderTimelineStreamingProps> = ({
    orderId,
    timelinePromise,
    renderTimelineItem,
}) => {
    return (
        <StreamingWrapper
            fallback={
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="flex items-center space-x-4">
                            <div className="w-3 h-3 bg-neutral-300 rounded-full animate-pulse" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-neutral-300 rounded animate-pulse" />
                                <div className="h-3 bg-neutral-300 rounded animate-pulse w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            }
        >
            <OrderTimelineContent
                orderId={orderId}
                timelinePromise={timelinePromise}
                renderTimelineItem={renderTimelineItem}
            />
        </StreamingWrapper>
    );
};

// Internal component for order timeline
const OrderTimelineContent: React.FC<OrderTimelineStreamingProps> = async ({
    orderId,
    timelinePromise,
    renderTimelineItem,
}) => {
    const timelineItems = await timelinePromise;

    return (
        <div className="space-y-4">
            {timelineItems.map((item, index) => renderTimelineItem(item))}
        </div>
    );
};

// Search results with progressive loading
interface SearchResultsStreamingProps {
    searchPromise: Promise<{
        results: any[];
        totalCount: number;
        query: string;
    }>;
    renderResult: (result: any) => React.ReactNode;
    onResultsLoad?: (results: any[]) => void;
}

export const SearchResultsStreaming: React.FC<SearchResultsStreamingProps> = ({
    searchPromise,
    renderResult,
    onResultsLoad,
}) => {
    return (
        <StreamingWrapper
            fallback={
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="h-6 bg-neutral-300 rounded animate-pulse w-32" />
                        <div className="h-4 bg-neutral-300 rounded animate-pulse w-16" />
                    </div>
                    <ProductGridSkeleton count={6} />
                </div>
            }
        >
            <SearchResultsContent
                searchPromise={searchPromise}
                renderResult={renderResult}
                onResultsLoad={onResultsLoad}
            />
        </StreamingWrapper>
    );
};

// Internal component for search results
const SearchResultsContent: React.FC<SearchResultsStreamingProps> = async ({
    searchPromise,
    renderResult,
    onResultsLoad,
}) => {
    const { results, totalCount, query } = await searchPromise;

    // Notify parent component that results have loaded
    if (onResultsLoad) {
        onResultsLoad(results);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                    Search Results for &ldquo;{query}&rdquo;
                </h2>
                <span className="text-sm text-neutral-600">
                    {totalCount} results
                </span>
            </div>

            {results.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {results.map((result) => renderResult(result))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-neutral-600">No results found for &ldquo;{query}&rdquo;</p>
                </div>
            )}
        </div>
    );
};

// Dashboard stats with progressive loading
interface DashboardStatsStreamingProps {
    statsPromise: Promise<{
        totalOrders: number;
        totalRevenue: number;
        totalProducts: number;
        totalCustomers: number;
    }>;
    renderStat: (key: string, value: number, loading?: boolean) => React.ReactNode;
}

export const DashboardStatsStreaming: React.FC<DashboardStatsStreamingProps> = ({
    statsPromise,
    renderStat,
}) => {
    return (
        <StreamingWrapper
            fallback={
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="h-4 bg-neutral-300 rounded animate-pulse mb-2" />
                            <div className="h-8 bg-neutral-300 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            }
        >
            <DashboardStatsContent
                statsPromise={statsPromise}
                renderStat={renderStat}
            />
        </StreamingWrapper>
    );
};

// Internal component for dashboard stats
const DashboardStatsContent: React.FC<DashboardStatsStreamingProps> = async ({
    statsPromise,
    renderStat,
}) => {
    const stats = await statsPromise;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {renderStat('orders', stats.totalOrders)}
            {renderStat('revenue', stats.totalRevenue)}
            {renderStat('products', stats.totalProducts)}
            {renderStat('customers', stats.totalCustomers)}
        </div>
    );
};

// Form with progressive validation
interface FormStreamingProps {
    children: React.ReactNode;
    validationPromise?: Promise<Record<string, string[]>>;
    onValidation?: (errors: Record<string, string[]>) => void;
}

export const FormStreaming: React.FC<FormStreamingProps> = ({
    children,
    validationPromise,
    onValidation,
}) => {
    return (
        <StreamingWrapper
            fallback={<FormSkeleton fields={6} />}
        >
            <FormContent
                validationPromise={validationPromise}
                onValidation={onValidation}
            >
                {children}
            </FormContent>
        </StreamingWrapper>
    );
};

// Internal component for form content
const FormContent: React.FC<{
    children: React.ReactNode;
    validationPromise?: Promise<Record<string, string[]>>;
    onValidation?: (errors: Record<string, string[]>) => void;
}> = async ({
    children,
    validationPromise,
    onValidation,
}) => {
        let validationErrors: Record<string, string[]> = {};

        if (validationPromise) {
            try {
                validationErrors = await validationPromise;
                if (onValidation) {
                    onValidation(validationErrors);
                }
            } catch (error) {
                console.error('Form validation error:', error);
            }
        }

        return (
            <div className="space-y-6">
                {children}
                {Object.keys(validationErrors).length > 0 && (
                    <div className="bg-error-50 border border-error-200 rounded-md p-4">
                        <h3 className="text-sm font-medium text-error-800 mb-2">
                            Please fix the following errors:
                        </h3>
                        <ul className="text-sm text-error-700 space-y-1">
                            {Object.entries(validationErrors).map(([field, errors]) => (
                                <li key={field}>
                                    <strong>{field}:</strong> {errors.join(', ')}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

// Infinite scroll with progressive loading
interface InfiniteScrollProps {
    itemsPromise: Promise<any[]>;
    hasMorePromise: Promise<boolean>;
    loadMore: () => void;
    renderItem: (item: any, index: number) => React.ReactNode;
    threshold?: number;
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
    itemsPromise,
    hasMorePromise,
    loadMore,
    renderItem,
    threshold = 100,
}) => {
    const [items, setItems] = React.useState<any[]>([]);
    const [hasMore, setHasMore] = React.useState(true);
    const [loading, setLoading] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        let isMounted = true;

        const loadInitialItems = async () => {
            setLoading(true);
            try {
                const [initialItems, moreAvailable] = await Promise.all([
                    itemsPromise,
                    hasMorePromise,
                ]);

                if (isMounted) {
                    setItems(initialItems);
                    setHasMore(moreAvailable);
                }
            } catch (error) {
                console.error('Failed to load initial items:', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadInitialItems();

        return () => {
            isMounted = false;
        };
    }, [itemsPromise, hasMorePromise]);

    React.useEffect(() => {
        const container = containerRef.current;
        if (!container || !hasMore || loading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(container);

        return () => observer.disconnect();
    }, [hasMore, loading, loadMore]);

    return (
        <div>
            <div className="space-y-4">
                {items.map((item, index) => renderItem(item, index))}
            </div>

            {loading && (
                <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                </div>
            )}

            <div ref={containerRef} className="h-4" />

            {!hasMore && items.length > 0 && (
                <div className="text-center py-8 text-neutral-600">
                    No more items to load
                </div>
            )}
        </div>
    );
};

// Progressive page loading
interface ProgressivePageProps {
    segments: Array<{
        id: string;
        component: React.ReactNode;
        priority?: 'high' | 'low';
        delay?: number;
    }>;
}

export const ProgressivePage: React.FC<ProgressivePageProps> = ({ segments }) => {
    const [visibleSegments, setVisibleSegments] = React.useState<Set<string>>(new Set());

    React.useEffect(() => {
        const loadSegments = async () => {
            // Load high priority segments immediately
            const highPriority = segments.filter(s => s.priority === 'high');
            const lowPriority = segments.filter(s => s.priority !== 'high');

            // Load high priority segments
            highPriority.forEach(segment => {
                setVisibleSegments(prev => new Set([...prev, segment.id]));
            });

            // Load low priority segments with delays
            for (const segment of lowPriority) {
                const delay = segment.delay || 100;
                setTimeout(() => {
                    setVisibleSegments(prev => new Set([...prev, segment.id]));
                }, delay);
            }
        };

        loadSegments();
    }, [segments]);

    return (
        <div className="space-y-8">
            {segments.map((segment) => (
                <div key={segment.id}>
                    {visibleSegments.has(segment.id) ? (
                        segment.component
                    ) : (
                        <div className="animate-pulse">
                            <SectionLoading rows={3} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

// Deferred component loading
interface DeferredComponentProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    delay?: number;
}

export const DeferredComponent: React.FC<DeferredComponentProps> = ({
    children,
    fallback = <div className="animate-pulse h-32 bg-neutral-200 rounded" />,
    delay = 0,
}) => {
    const [isVisible, setIsVisible] = React.useState(delay === 0);

    React.useEffect(() => {
        if (delay > 0) {
            const timer = setTimeout(() => setIsVisible(true), delay);
            return () => clearTimeout(timer);
        }
    }, [delay]);

    return (
        <>
            {isVisible ? children : fallback}
        </>
    );
};

// Streaming text component (for progressive content loading)
interface StreamingTextProps {
    textPromise: Promise<string>;
    className?: string;
    speed?: 'slow' | 'normal' | 'fast';
}

export const StreamingText: React.FC<StreamingTextProps> = ({
    textPromise,
    className = '',
    speed = 'normal',
}) => {
    const [text, setText] = React.useState('');
    const [isComplete, setIsComplete] = React.useState(false);

    React.useEffect(() => {
        let isMounted = true;

        const streamText = async () => {
            try {
                const fullText = await textPromise;

                if (!isMounted) return;

                const delay = {
                    slow: 100,
                    normal: 50,
                    fast: 25,
                }[speed];

                let currentIndex = 0;

                const typeNextChar = () => {
                    if (!isMounted) return;

                    if (currentIndex < fullText.length) {
                        setText(fullText.slice(0, currentIndex + 1));
                        currentIndex++;
                        setTimeout(typeNextChar, delay);
                    } else {
                        setIsComplete(true);
                    }
                };

                typeNextChar();
            } catch (error) {
                console.error('Streaming text error:', error);
                if (isMounted) {
                    setIsComplete(true);
                }
            }
        };

        streamText();

        return () => {
            isMounted = false;
        };
    }, [textPromise, speed]);

    return (
        <span className={`${className} ${!isComplete ? 'after:content-["▊"] after:animate-pulse' : ''}`}>
            {text}
        </span>
    );
};

// Parallel data loading component
interface ParallelLoaderProps {
    loaders: Array<{
        id: string;
        promise: Promise<any>;
        render: (data: any) => React.ReactNode;
    }>;
    layout?: 'grid' | 'flex' | 'stack';
    className?: string;
}

export const ParallelLoader: React.FC<ParallelLoaderProps> = ({
    loaders,
    layout = 'stack',
    className = '',
}) => {
    const [loadedData, setLoadedData] = React.useState<Map<string, any>>(new Map());
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);

            try {
                const promises = loaders.map(async (loader) => {
                    const data = await loader.promise;
                    return { id: loader.id, data };
                });

                const results = await Promise.allSettled(promises);

                results.forEach((result) => {
                    if (result.status === 'fulfilled') {
                        setLoadedData(prev => new Map(prev.set(result.value.id, result.value.data)));
                    }
                });
            } catch (error) {
                console.error('Parallel loading error:', error);
            } finally {
                setLoading(false);
            }
        };

        loadAllData();
    }, [loaders]);

    if (loading) {
        return <SectionLoading className={className} />;
    }

    const layoutClasses = {
        grid: 'grid grid-cols-1 md:grid-cols-2 gap-6',
        flex: 'flex flex-col md:flex-row gap-6',
        stack: 'space-y-6',
    };

    return (
        <div className={`${layoutClasses[layout]} ${className}`}>
            {loaders.map((loader) => {
                const data = loadedData.get(loader.id);
                return data ? (
                    <div key={loader.id}>
                        {loader.render(data)}
                    </div>
                ) : null;
            })}
        </div>
    );
};
