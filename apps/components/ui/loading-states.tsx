import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
    animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className,
    animate = true
}) => {
    return (
        <div
            className={cn(
                'bg-neutral-200 dark:bg-neutral-800 rounded-md',
                animate && 'animate-pulse',
                className
            )}
        />
    );
};

// Product card skeleton
export const ProductCardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={cn('space-y-3', className)}>
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-1/4" />
            </div>
        </div>
    );
};

// Product grid skeleton
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, index) => (
                <ProductCardSkeleton key={index} />
            ))}
        </div>
    );
};

// Merchant card skeleton
export const MerchantCardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={cn('space-y-3', className)}>
            <Skeleton className="h-32 w-full rounded-lg" />
            <div className="space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex space-x-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                </div>
            </div>
        </div>
    );
};

// Order item skeleton
export const OrderItemSkeleton: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={cn('flex items-center space-x-4 py-4', className)}>
            <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
            </div>
            <div className="text-right space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-12" />
            </div>
        </div>
    );
};

// Loading spinner component
interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    className
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12',
    };

    return (
        <div className={cn('inline-flex items-center justify-center', className)}>
            <div
                className={cn(
                    'border-2 border-neutral-300 border-t-primary-600 rounded-full animate-spin',
                    sizeClasses[size]
                )}
            />
        </div>
    );
};

// Loading dots animation
export const LoadingDots: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={cn('flex space-x-1', className)}>
            {[0, 1, 2].map((index) => (
                <div
                    key={index}
                    className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                    style={{
                        animationDelay: `${index * 0.1}s`,
                        animationDuration: '0.6s',
                    }}
                />
            ))}
        </div>
    );
};

// Page loading overlay
export const PageLoading: React.FC<{
    message?: string;
    className?: string;
}> = ({
    message = 'Loading...',
    className
}) => {
        return (
            <div className={cn(
                'fixed inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center z-50',
                className
            )}>
                <div className="text-center space-y-4">
                    <LoadingSpinner size="lg" />
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {message}
                    </p>
                </div>
            </div>
        );
    };

// Section loading state
export const SectionLoading: React.FC<{
    rows?: number;
    className?: string;
}> = ({
    rows = 3,
    className
}) => {
        return (
            <div className={cn('space-y-4', className)}>
                {Array.from({ length: rows }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                ))}
            </div>
        );
    };

// Form loading state
export const FormSkeleton: React.FC<{
    fields?: number;
    hasButtons?: boolean;
    className?: string;
}> = ({
    fields = 4,
    hasButtons = true,
    className
}) => {
        return (
            <div className={cn('space-y-6', className)}>
                {Array.from({ length: fields }).map((_, index) => (
                    <div key={index} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ))}
                {hasButtons && (
                    <div className="flex space-x-3 pt-4">
                        <Skeleton className="h-10 w-20" />
                        <Skeleton className="h-10 w-20" />
                    </div>
                )}
            </div>
        );
    };

// Table loading state
export const TableSkeleton: React.FC<{
    rows?: number;
    columns?: number;
    className?: string;
}> = ({
    rows = 5,
    columns = 4,
    className
}) => {
        return (
            <div className={cn('space-y-4', className)}>
                {/* Header */}
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                    {Array.from({ length: columns }).map((_, index) => (
                        <Skeleton key={index} className="h-6 w-full" />
                    ))}
                </div>
                {/* Rows */}
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <Skeleton key={colIndex} className="h-4 w-full" />
                        ))}
                    </div>
                ))}
            </div>
        );
    };

// Image placeholder with loading state
export const ImagePlaceholder: React.FC<{
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    hasIcon?: boolean;
}> = ({
    className,
    size = 'md',
    hasIcon = false
}) => {
        const sizeClasses = {
            sm: 'w-16 h-16',
            md: 'w-32 h-32',
            lg: 'w-48 h-48',
        };

        return (
            <div className={cn(
                'bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center',
                'animate-pulse',
                sizeClasses[size],
                className
            )}>
                {hasIcon && (
                    <svg
                        className="w-8 h-8 text-neutral-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                )}
            </div>
        );
    };

// Progressive loading component
export const ProgressiveLoader: React.FC<{
    children: React.ReactNode;
    fallback?: React.ReactNode;
    delay?: number;
    className?: string;
}> = ({
    children,
    fallback,
    delay = 0,
    className
}) => {
        const [isLoading, setIsLoading] = React.useState(delay > 0);

        React.useEffect(() => {
            if (delay > 0) {
                const timer = setTimeout(() => setIsLoading(false), delay);
                return () => clearTimeout(timer);
            }
        }, [delay]);

        if (isLoading) {
            return (
                <div className={cn('animate-pulse', className)}>
                    {fallback || <Skeleton className="w-full h-full" />}
                </div>
            );
        }

        return <>{children}</>;
    };

// Content loading with shimmer effect
export const ShimmerLoader: React.FC<{
    className?: string;
    lines?: number;
}> = ({
    className,
    lines = 3
}) => {
        return (
            <div className={cn('space-y-3', className)}>
                {Array.from({ length: lines }).map((_, index) => (
                    <div
                        key={index}
                        className="h-4 bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800 rounded animate-pulse"
                        style={{
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 1.5s infinite',
                        }}
                    />
                ))}
            </div>
        );
    };

// Button loading state
export const ButtonLoading: React.FC<{
    children: React.ReactNode;
    loading?: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}> = ({
    children,
    loading = false,
    className,
    size = 'md'
}) => {
        const sizeClasses = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-base',
            lg: 'px-6 py-3 text-lg',
        };

        return (
            <button
                className={cn(
                    'inline-flex items-center justify-center rounded-md font-medium transition-colors',
                    'bg-primary/60 text-white hover:bg-primary/70',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    sizeClasses[size],
                    className
                )}
                disabled={loading}
            >
                {loading && <LoadingSpinner size="sm" className="mr-2" />}
                {children}
            </button>
        );
    };

// Infinite scroll loader
export const InfiniteLoader: React.FC<{
    hasMore?: boolean;
    isLoading?: boolean;
    className?: string;
}> = ({
    hasMore = true,
    isLoading = false,
    className
}) => {
        if (!hasMore) return null;

        return (
            <div className={cn('flex justify-center py-8', className)}>
                {isLoading ? (
                    <div className="flex items-center space-x-2">
                        <LoadingSpinner size="sm" />
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            Loading more...
                        </span>
                    </div>
                ) : (
                    <div className="text-sm text-neutral-500 dark:text-neutral-500">
                        Scroll down for more content
                    </div>
                )}
            </div>
        );
    };

// Error loading state
export const ErrorState: React.FC<{
    title?: string;
    message?: string;
    onRetry?: () => void;
    className?: string;
}> = ({
    title = 'Something went wrong',
    message = 'We encountered an error while loading this content.',
    onRetry,
    className
}) => {
        return (
            <div className={cn(
                'flex flex-col items-center justify-center py-12 px-4 text-center',
                className
            )}>
                <div className="w-16 h-16 bg-error-100 dark:bg-error-900 rounded-full flex items-center justify-center mb-4">
                    <svg
                        className="w-8 h-8 text-error-600 dark:text-error-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    {title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4 max-w-md">
                    {message}
                </p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="inline-flex items-center px-4 py-2 bg-primary/60 text-white rounded-md hover:bg-primary/70 transition-colors"
                    >
                        Try Again
                    </button>
                )}
            </div>
        );
    };

// Empty state component
export const EmptyState: React.FC<{
    icon?: React.ReactNode;
    title: string;
    message?: string;
    action?: React.ReactNode;
    className?: string;
}> = ({
    icon,
    title,
    message,
    action,
    className
}) => {
        return (
            <div className={cn(
                'flex flex-col items-center justify-center py-12 px-4 text-center',
                className
            )}>
                {icon && (
                    <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                        {icon}
                    </div>
                )}
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    {title}
                </h3>
                {message && (
                    <p className="text-neutral-600 dark:text-neutral-400 mb-4 max-w-md">
                        {message}
                    </p>
                )}
                {action}
            </div>
        );
    };

// Add shimmer animation to global CSS
const shimmerStyles = `
@keyframes shimmer {
    0% {
        background-position: -200% 0;
    }
    100% {
        background-position: 200% 0;
    }
}
`;

// Inject shimmer styles
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = shimmerStyles;
    document.head.appendChild(style);
}