"use client"

// Comprehensive Cumulative Layout Shift (CLS) Optimization System
import { cn } from '@/lib/utils';
import NextImage, { type ImageProps } from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react';
export const FAKE_BLUR =
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQrJiEwUy0rLysuKCkwN0Y/ODNANykpQFdCS05QT0hHSlFWW1FSN05PW1H/2wBDARUXFx4eHR8eHVFLJSwtUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVH/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
const BLUR = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAeEAABBAIDAQAAAAAAAAAAAAABAAIDBBFRBhIhcf/EABUBAQEAAAAAAAAAAAAAAAAAAAME/8QAFhEAAwAAAAAAAAAAAAAAAAAAABES/9oADAMBAAIRAxEAPwCd2XQOewT7K2K8fWj8bHk3j6i79/gA0L8R//2Q=="
// Font loading optimization to prevent layout shifts
export function useFontLoader() {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        // Check if fonts are already loaded
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                setFontsLoaded(true);
            });
        } else {
            // Fallback for browsers without font API
            setTimeout(() => setFontsLoaded(true), 100);
        }
    }, []);

    return fontsLoaded;
}

// Image dimension utilities for CLS prevention
export interface ImageDimensions {
    width: number;
    height: number;
    aspectRatio: number;
}

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
    // Loading optimization
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    preload?: boolean;

    // Placeholder and fallbacks
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    fallbackSrc?: string;

    // Performance monitoring
    onLoad?: (success: boolean) => void;
    onError?: (error: Error) => void;

    // Responsive behavior
    responsive?: boolean;
    sizes?: string;

    // Animation
    animate?: boolean;
    animationDelay?: number;

    // Error handling
    retryCount?: number;
    retryDelay?: number;
}

function getResponsiveSizes(width?: number, height?: number): string {
    if (!width || !height) return '100vw';


    return `
        (max-width: 640px) 100vw,
        (max-width: 768px) 50vw,
        (max-width: 1024px) 33vw,
        (max-width: 1280px) 25vw,
        ${Math.min(width, 384)}px
    `;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    width,
    height,
    blurDataURL,
    fallbackSrc,
    onLoad,
    onError,
    responsive = true,
    sizes,
    retryCount = 2,
    retryDelay = 1000,
    style,
    ...props
}) => {
    const [imageSrc, setImageSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [retryAttempts, setRetryAttempts] = useState(0);
    const imgRef = useRef<HTMLImageElement>(null);

    // Update imageSrc when src prop changes
    useEffect(() => {
        setImageSrc(src);
        setIsLoading(true);
        setHasError(false);
        setRetryAttempts(0);
    }, [src]);

    // Generate responsive sizes if not provided
    const imageSizes = sizes ?? (responsive ? getResponsiveSizes(width as number, height as number) : undefined);

    const handleLoad = () => {
        setIsLoading(false);
        setHasError(false);
        onLoad?.(true);
    };

    const handleError = () => {
        setIsLoading(false);

        // Retry logic
        if (retryAttempts < retryCount) {
            setTimeout(() => {
                setRetryAttempts(prev => prev + 1);
                setImageSrc(src);
                setHasError(false);
            }, retryDelay);
            return;
        }

        if (fallbackSrc && imageSrc !== fallbackSrc) {
            setImageSrc(fallbackSrc);
            setHasError(false);
            return;
        }

        setHasError(true);
        setImageSrc(blurDataURL || FAKE_BLUR);
        onError?.(new Error(`Failed to load image: ${src}`));
        onLoad?.(false);
    };
    return (
        <>
            <NextImage
                ref={imgRef}
                src={src}
                alt={alt}
                {...(props.fill ? {} : { width, height })}
                blurDataURL={BLUR}
                placeholder={hasError ? 'empty' : 'blur'}
                sizes={imageSizes}
                loading='lazy'
                onError={handleError}
                onLoad={handleLoad}
                style={{
                    ...style,
                    filter: hasError ? 'grayscale(100%)' : 'none',
                }}
                {...props}
            />

            {/* Loading state overlay */}
            {isLoading && !blurDataURL && (
                <div
                    className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center"
                    style={{ zIndex: 1 }}
                >
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}

        </>
    );
};


// Skeleton component for content loading
interface SkeletonProps {
    className?: string;
    lines?: number;
    height?: string;
    width?: string;
    variant?: 'text' | 'rectangular' | 'circular';
}

export function Skeleton({
    className,
    lines = 1,
    height = 'h-4',
    width,
    variant = 'text'
}: SkeletonProps) {
    const baseClasses = "bg-gray-200 animate-pulse rounded";

    if (variant === 'circular') {
        return (
            <div
                className={cn(baseClasses, "rounded-full aspect-square", className)}
                style={{ width: width || '2rem', height: width || '2rem' }}
            />
        );
    }

    if (variant === 'rectangular') {
        return (
            <div
                className={cn(baseClasses, className)}
                style={{
                    width: width || '100%',
                    height: height,
                }}
            />
        );
    }

    // Text variant
    return (
        <div className={cn("space-y-2", className)}>
            {Array.from({ length: lines }).map((_, index) => (
                <div
                    key={index}
                    className={cn(
                        baseClasses,
                        height,
                        index === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
                    )}
                    style={{
                        width: index === lines - 1 && lines > 1 ? "75%" : width || "100%",
                    }}
                />
            ))}
        </div>
    );
}

// Product card skeleton for preventing CLS
export function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Image skeleton */}
            <div className="aspect-square bg-gray-200 animate-pulse" />

            <div className="p-3 space-y-3">
                {/* Title skeleton */}
                <Skeleton lines={2} height="h-4" className="space-y-2" />

                {/* Price and badge skeleton */}
                <div className="flex items-center justify-between">
                    <Skeleton width="60px" height="h-5" />
                    <Skeleton width="40px" height="h-4" />
                </div>

                {/* Stock status skeleton */}
                <div className="flex items-center space-x-2">
                    <Skeleton variant="circular" width="16px" />
                    <Skeleton width="80px" height="h-3" />
                </div>

                {/* Rating skeleton */}
                <div className="flex items-center space-x-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} variant="circular" width="12px" />
                    ))}
                    <Skeleton width="40px" height="h-3" className="ml-2" />
                </div>
            </div>
        </div>
    );
}

// Store card skeleton
export function StoreCardSkeleton() {
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Header skeleton */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    <Skeleton variant="circular" width="48px" />
                    <div className="flex-1">
                        <Skeleton height="h-5" className="mb-2" />
                        <Skeleton width="60%" height="h-3" />
                    </div>
                </div>
            </div>

            {/* Stats skeleton */}
            <div className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="text-center">
                            <Skeleton height="h-6" className="mb-1" />
                            <Skeleton height="h-3" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Grid skeleton for multiple items
interface GridSkeletonProps {
    items?: number;
    variant?: 'product' | 'store';
    columns?: 2 | 3 | 4 | 5;
}

export function GridSkeleton({
    items = 8,
    variant = 'product',
    columns = 4
}: GridSkeletonProps) {
    const gridCols = {
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
    };

    const SkeletonComponent = variant === 'product' ? ProductCardSkeleton : StoreCardSkeleton;

    return (
        <div className={cn(
            "grid gap-4 md:gap-6",
            gridCols[columns]
        )}>
            {Array.from({ length: items }).map((_, index) => (
                <SkeletonComponent key={index} />
            ))}
        </div>
    );
}

interface StableTextProps {
    children: React.ReactNode;
    className?: string;
    lines?: number;
    lineHeight?: string;
}

export function StableText({
    children,
    className,
    lines = 1,
    lineHeight = 'leading-normal'
}: StableTextProps) {
    const height = useMemo(() => {
        const baseHeight = 1.2; // rem
        return `${lines * baseHeight}rem`;
    }, [lines]);

    return (
        <div
            className={cn("overflow-hidden", lineHeight, className)}
            style={{
                minHeight: height,
                maxHeight: height,
                lineHeight: 'inherit',
            }}
        >
            {children}
        </div>
    );
}

// Font display optimization for CLS prevention
export function FontOptimizer({ children }: { children: React.ReactNode }) {
    const fontsLoaded = useFontLoader();

    return (
        <div
            className={cn(
                "transition-opacity duration-200",
                fontsLoaded ? "opacity-100" : "opacity-90"
            )}
            style={{
                // Use font-display: swap equivalent with proper fallbacks
                fontFamily: fontsLoaded
                    ? 'var(--font-geist-sans), "Inter", system-ui, -apple-system, sans-serif'
                    : 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
            }}
        >
            {children}
        </div>
    );
}
