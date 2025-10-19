"use client"

// Comprehensive Cumulative Layout Shift (CLS) Optimization System
import { cn } from '@/lib/utils';
import NextImage, { type ImageProps } from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react';

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

export function useImageDimensions(src?: string): ImageDimensions | null {
    const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        if (!src) return;

        const img = new Image();
        img.onload = () => {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            setDimensions({
                width: img.naturalWidth,
                height: img.naturalHeight,
                aspectRatio,
            });
        };
        img.src = src;

        return () => {
            img.onload = null;
        };
    }, [src]);

    return dimensions;
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

    const aspectRatio = width / height;

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
    priority = false,
    loading = 'lazy',
    preload = false,
    placeholder,
    blurDataURL,
    fallbackSrc,
    onLoad,
    onError,
    responsive = true,
    sizes,
    animate = true,
    animationDelay = 0,
    retryCount = 2,
    retryDelay = 1000,
    className,
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

    // Preload image if requested
    useEffect(() => {
        if (preload && typeof window !== 'undefined') {
            const img = new window.Image();
            img.onload = () => {
                // Image preloaded successfully
            };
            img.src = src as string;
        }
    }, [src, preload]);

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
        onError?.(new Error(`Failed to load image: ${src}`));
        onLoad?.(false);
    };

    // Animation styles
    const animationStyles: React.CSSProperties = animate ? {
        opacity: isLoading ? 0 : 1,
        transition: `opacity 0.3s ease-in-out`,
        transitionDelay: `${animationDelay}ms`,
    } : {};

    return (
        <>
            <NextImage
                ref={imgRef}
                src={imageSrc}
                alt={alt}
                {...(props.fill ? {} : { width, height })}
                priority={priority}
                loading={loading}
                placeholder={placeholder ?? (blurDataURL ? 'blur' : 'empty')}
                blurDataURL={blurDataURL}
                sizes={imageSizes}
                onLoadingComplete={() => {
                    handleLoad();
                }}
                onError={handleError}
                className={cn(
                    'transition-opacity duration-300',
                    isLoading && 'opacity-0',
                    hasError && 'opacity-50',
                    animate && 'ease-in-out',
                    className
                )}
                style={{
                    ...animationStyles,
                    ...style,
                    filter: hasError ? 'grayscale(100%)' : 'none',
                }}
                {...props}
            />

            {/* Loading state overlay */}
            {isLoading && (
                <div
                    className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center"
                    style={{ zIndex: 1 }}
                >
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Error state overlay */}
            {hasError && (
                <div
                    className="absolute inset-0 bg-muted/50 flex items-center justify-center"
                    style={{ zIndex: 2 }}
                >
                    <div className="text-center text-muted-foreground">
                        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs">Failed to load</p>
                    </div>
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

// Layout shift prevention hook
export function useLayoutShiftPrevention() {
    const [isStable, setIsStable] = useState(false);

    useEffect(() => {
        // Wait for fonts and critical resources to load
        const checkStability = async () => {
            try {
                // Wait for fonts to load
                if (document.fonts && document.fonts.ready) {
                    await document.fonts.ready;
                }

                // Wait for images to load (at least above the fold)
                const aboveFoldImages = Array.from(document.querySelectorAll('img')).slice(0, 10);
                await Promise.all(
                    aboveFoldImages.map(img => {
                        if (img.complete) return Promise.resolve();
                        return new Promise(resolve => {
                            img.onload = resolve;
                            img.onerror = resolve;
                        });
                    })
                );

                setIsStable(true);
            } catch (error) {
                console.warn('Layout stability check failed:', error);
                // Fallback to timeout
                setTimeout(() => setIsStable(true), 2000);
            }
        };

        checkStability();
    }, []);

    return isStable;
}

// Container with stable dimensions
interface StableContainerProps {
    children: React.ReactNode;
    className?: string;
    minHeight?: string;
    fallback?: React.ReactNode;
    isLoading?: boolean;
}

export function StableContainer({
    children,
    className,
    minHeight,
    fallback,
    isLoading = false
}: StableContainerProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current && !isLoading) {
            // Set minimum height to prevent layout shifts when content changes
            const height = containerRef.current.offsetHeight;
            if (height > 0) {
                containerRef.current.style.minHeight = `${height}px`;
            }
        }
    }, [children, isLoading]);

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative transition-opacity duration-200",
                isLoading ? "opacity-0" : "opacity-100",
                className
            )}
            style={{
                ...(minHeight && { minHeight }),
            }}
        >
            {isLoading && fallback ? fallback : children}
        </div>
    );
}

// Text component with stable line heights
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
        // Approximate height based on line count and typical font size
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

// Performance monitoring for CLS
export function useCLSMonitoring() {
    const [clsValue, setClsValue] = useState<number>(0);

    useEffect(() => {
        if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
            return;
        }

        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
                        setClsValue(prev => prev + (entry as any).value);
                    }
                }
            });

            observer.observe({ entryTypes: ['layout-shift'] });

            return () => {
                observer.disconnect();
            };
        } catch (error) {
            console.warn('CLS monitoring not supported:', error);
        }
    }, []);

    return clsValue;
}

// Web Vitals integration for CLS tracking
export function reportCLS(onPerfEntry?: (metric: any) => void) {
    if (typeof window === 'undefined' || !('web-vitals' in window)) {
        return;
    }

    try {
        // This would normally use the web-vitals library
        // For now, we'll use the PerformanceObserver approach
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
                    onPerfEntry?.({
                        name: 'CLS',
                        value: (entry as any).value,
                        rating: (entry as any).value > 0.25 ? 'poor' : (entry as any).value > 0.1 ? 'needs-improvement' : 'good',
                    });
                }
            }
        });

        observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
        console.warn('CLS reporting failed:', error);
    }
}

// Optimized Next.js Image component wrapper
interface CLSOptimizedImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    sizes?: string;
    style?: React.CSSProperties;
    onLoad?: () => void;
    onError?: () => void;
}

export function CLSOptimizedImage({
    src,
    alt,
    width,
    height,
    className,
    priority = false,
    sizes,
    style,
    onLoad,
    onError,
    ...props
}: CLSOptimizedImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        setImageError(true);
        onError?.();
    };

    // Calculate aspect ratio for consistent layout
    const aspectRatio = width && height ? width / height : undefined;

    return (
        <div
            className={cn("relative overflow-hidden bg-gray-100", className)}
            style={{
                ...(aspectRatio && { aspectRatio }),
                ...style,
            }}
        >
            {!imageError ? (
                <img
                    {...props}
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    className={cn(
                        "w-full h-full object-cover transition-opacity duration-300",
                        isLoaded ? "opacity-100" : "opacity-0"
                    )}
                    onLoad={handleLoad}
                    onError={handleError}
                    loading={priority ? "eager" : "lazy"}
                    decoding="async"
                    sizes={sizes}
                />
            ) : (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <div className="text-gray-400 text-center">
                        <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                            📷
                        </div>
                        <span className="text-xs">Image unavailable</span>
                    </div>
                </div>
            )}

            {/* Loading state */}
            {!isLoaded && !imageError && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                </div>
            )}
        </div>
    );
}

// Hook for measuring element dimensions
export function useElementDimensions<T extends HTMLElement>() {
    const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
    const elementRef = useRef<T>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const updateDimensions = () => {
            setDimensions({
                width: element.offsetWidth,
                height: element.offsetHeight,
            });
        };

        // Initial measurement
        updateDimensions();

        // Observe size changes
        const resizeObserver = new ResizeObserver(updateDimensions);
        resizeObserver.observe(element);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    return { dimensions, elementRef };
}

// Dynamic content container that prevents layout shifts
interface DynamicContentProps {
    children: React.ReactNode;
    className?: string;
    minHeight?: string;
    animate?: boolean;
}

export function DynamicContent({
    children,
    className,
    minHeight,
    animate = true
}: DynamicContentProps) {
    const { dimensions, elementRef } = useElementDimensions<HTMLDivElement>();

    return (
        <div
            ref={elementRef}
            className={cn(
                "relative transition-all duration-300 ease-in-out",
                animate && "animate-in fade-in-0 slide-in-from-top-2",
                className
            )}
            style={{
                ...(dimensions && { minHeight: `${dimensions.height}px` }),
                ...((minHeight && !dimensions) && { minHeight }),
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

// Advanced font preloading utilities
export class FontPreloader {
    private static loadedFonts = new Set<string>();
    private static loadingPromises = new Map<string, Promise<void>>();

    // Preload a font with advanced options
    static async preloadFont(
        fontUrl: string,
        fontFamily: string,
        options: {
            weight?: string | number;
            style?: 'normal' | 'italic';
            display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
            unicodeRange?: string;
            as?: 'font';
        } = {}
    ): Promise<void> {
        const fontKey = `${fontFamily}-${fontUrl}-${options.weight || '400'}-${options.style || 'normal'}`;

        // Return existing promise if already loading
        if (this.loadingPromises.has(fontKey)) {
            return this.loadingPromises.get(fontKey);
        }

        // Return immediately if already loaded
        if (this.loadedFonts.has(fontKey)) {
            return Promise.resolve();
        }

        const loadPromise = new Promise<void>((resolve, reject) => {
            // Create font face
            const fontFace = new FontFace(fontFamily, `url(${fontUrl})`, {
                weight: String(options.weight || '400'),
                style: options.style || 'normal',
                display: options.display || 'swap',
                unicodeRange: options.unicodeRange,
            });

            // Load the font
            fontFace.load()
                .then((loadedFace) => {
                    document.fonts.add(loadedFace);
                    this.loadedFonts.add(fontKey);
                    resolve();
                })
                .catch((error) => {
                    console.warn(`Failed to load font ${fontFamily}:`, error);
                    reject(error);
                });
        });

        this.loadingPromises.set(fontKey, loadPromise);
        return loadPromise;
    }

    // Preload Google Fonts with optimization
    static async preloadGoogleFont(
        fontFamily: string,
        weights: (number | string)[] = [400, 500, 600, 700],
        styles: ('normal' | 'italic')[] = ['normal']
    ): Promise<void> {
        const promises = [];

        for (const weight of weights) {
            for (const style of styles) {
                // Generate Google Fonts URL
                const googleUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@${weight}${style !== 'normal' ? `;${style}` : ''}&display=swap`;

                try {
                    const response = await fetch(googleUrl);
                    const cssText = await response.text();

                    // Extract font URLs from CSS
                    const fontUrlMatches = cssText.match(/url\(([^)]+)\)/g);
                    if (fontUrlMatches) {
                        for (const match of fontUrlMatches) {
                            const fontUrl = match.replace(/url\(['"]?([^'"]+)['"]?\)/, '$1');
                            if (fontUrl.includes('fonts.gstatic.com')) {
                                promises.push(
                                    this.preloadFont(fontUrl, fontFamily, {
                                        weight,
                                        style,
                                        display: 'swap'
                                    })
                                );
                            }
                        }
                    }
                } catch (error) {
                    console.warn(`Failed to preload Google Font ${fontFamily}:`, error);
                }
            }
        }

        await Promise.allSettled(promises);
    }

    // Optimize font loading for better performance
    static optimizeFontLoading() {
        // Add font-display: swap to all @font-face rules
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-display: swap !important;
            }
        `;
        document.head.appendChild(style);

        // Preload critical fonts
        this.preloadGoogleFont('Inter', [400, 500, 600, 700]);
    }

    // Get font loading status
    static getFontLoadingStatus(): {
        totalFonts: number;
        loadedFonts: number;
        loadingFonts: number;
    } {
        return {
            totalFonts: this.loadedFonts.size + this.loadingPromises.size,
            loadedFonts: this.loadedFonts.size,
            loadingFonts: this.loadingPromises.size,
        };
    }
}

// Export utility functions for external use
export const CLSTools = {
    // Measure layout shift
    measureLayoutShift: () => {
        if (typeof window === 'undefined') return 0;

        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
                    clsValue += (entry as any).value;
                }
            }
        });

        try {
            observer.observe({ entryTypes: ['layout-shift'] });
            return () => observer.disconnect();
        } catch (error) {
            console.warn('Layout shift measurement not available:', error);
            return () => { };
        }
    },

    // Reserve space for dynamic content
    reserveSpace: (element: HTMLElement, minHeight?: number) => {
        if (minHeight) {
            element.style.minHeight = `${minHeight}px`;
        }
    },

    // Optimize images for CLS prevention
    optimizeImages: (container: HTMLElement) => {
        const images = container.querySelectorAll('img');

        images.forEach((img: HTMLImageElement) => {
            // Add loading optimization
            if (!img.loading) {
                img.loading = 'lazy';
            }

            // Add decoding optimization
            if (!img.decoding) {
                img.decoding = 'async';
            }

            // Reserve space if dimensions are known
            if (img.naturalWidth && img.naturalHeight) {
                const aspectRatio = img.naturalWidth / img.naturalHeight;
                const container = img.parentElement;
                if (container && !container.style.aspectRatio) {
                    container.style.aspectRatio = aspectRatio.toString();
                }
            }
        });
    },
};