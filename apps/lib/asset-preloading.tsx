// Asset Preloading Optimization System
import { useEffect, useState, useCallback } from 'react';

// Asset types and priorities
export enum AssetType {
    IMAGE = 'image',
    SCRIPT = 'script',
    STYLE = 'style',
    FONT = 'font',
    VIDEO = 'video',
    AUDIO = 'audio'
}

export enum AssetPriority {
    CRITICAL = 'critical',
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low'
}

export interface AssetConfig {
    url: string;
    type: AssetType;
    priority: AssetPriority;
    crossOrigin?: string;
    as?: string;
    media?: string;
    sizes?: string;
    integrity?: string;
    referrerPolicy?: string;
    loadCondition?: () => boolean;
    preload?: boolean;
    prefetch?: boolean;
}

// Asset loading state
export interface AssetState {
    url: string;
    isLoading: boolean;
    isLoaded: boolean;
    hasError: boolean;
    loadTime?: number;
    size?: number;
}

// Preloading strategies
export class AssetPreloader {
    private static loadedAssets = new Map<string, AssetState>();
    private static loadingPromises = new Map<string, Promise<void>>();
    private static preloadQueue: AssetConfig[] = [];
    private static observer?: IntersectionObserver;

    // Initialize intersection observer for viewport-based preloading
    private static initIntersectionObserver(): void {
        if (this.observer || typeof window === 'undefined') return;

        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const element = entry.target as HTMLElement;
                        const assetUrl = element.dataset.preloadAsset;

                        if (assetUrl) {
                            this.preloadAsset({
                                url: assetUrl,
                                type: AssetType.IMAGE,
                                priority: AssetPriority.MEDIUM,
                                preload: true
                            });
                        }

                        this.observer?.unobserve(element);
                    }
                });
            },
            { rootMargin: '50px' }
        );
    }

    // Generate asset key for tracking
    private static getAssetKey(asset: AssetConfig): string {
        return `${asset.type}:${asset.url}`;
    }

    // Check if asset should be preloaded based on conditions
    private static shouldPreload(asset: AssetConfig): boolean {
        if (asset.loadCondition) {
            return asset.loadCondition();
        }
        return asset.preload !== false;
    }

    // Preload a single asset
    static async preloadAsset(asset: AssetConfig): Promise<void> {
        const assetKey = this.getAssetKey(asset);

        // Return if already loaded or loading
        if (this.loadedAssets.has(assetKey)) {
            const state = this.loadedAssets.get(assetKey)!;
            if (state.isLoaded) return Promise.resolve();
            if (state.isLoading && this.loadingPromises.has(assetKey)) {
                return this.loadingPromises.get(assetKey);
            }
        }

        if (!this.shouldPreload(asset)) {
            return Promise.resolve();
        }

        const loadPromise = this.loadAsset(asset);
        this.loadingPromises.set(assetKey, loadPromise);

        try {
            await loadPromise;
            this.loadedAssets.set(assetKey, {
                url: asset.url,
                isLoading: false,
                isLoaded: true,
                hasError: false,
                loadTime: performance.now()
            });
        } catch (error) {
            this.loadedAssets.set(assetKey, {
                url: asset.url,
                isLoading: false,
                isLoaded: false,
                hasError: true,
                loadTime: performance.now()
            });
            throw error;
        }
    }

    // Load asset implementation
    private static async loadAsset(asset: AssetConfig): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const link = document.createElement('link');

                // Set common attributes
                link.rel = asset.preload ? 'preload' : 'prefetch';
                link.href = asset.url;

                if (asset.as) link.as = asset.as;
                if (asset.crossOrigin) link.crossOrigin = asset.crossOrigin;
                if (asset.media) link.media = asset.media;
                if (asset.sizes) link.sizes = asset.sizes;
                if (asset.integrity) link.integrity = asset.integrity;
                if (asset.referrerPolicy) link.referrerPolicy = asset.referrerPolicy;

                const handleLoad = () => {
                    link.onload = null;
                    link.onerror = null;
                    resolve();
                };

                const handleError = () => {
                    link.onload = null;
                    link.onerror = null;
                    reject(new Error(`Failed to load asset: ${asset.url}`));
                };

                link.onload = handleLoad;
                link.onerror = handleError;

                document.head.appendChild(link);

            } catch (error) {
                reject(error);
            }
        });
    }

    // Preload multiple assets with priority-based loading
    static async preloadAssets(assets: AssetConfig[]): Promise<void> {
        // Sort by priority (critical first)
        const sortedAssets = [...assets].sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        // Group by priority for sequential loading within same priority
        const priorityGroups = sortedAssets.reduce((groups, asset) => {
            if (!groups[asset.priority]) {
                groups[asset.priority] = [];
            }
            groups[asset.priority].push(asset);
            return groups;
        }, {} as Record<AssetPriority, AssetConfig[]>);

        // Load each priority group sequentially
        for (const priority of [AssetPriority.CRITICAL, AssetPriority.HIGH, AssetPriority.MEDIUM, AssetPriority.LOW]) {
            if (priorityGroups[priority]) {
                const promises = priorityGroups[priority].map(asset => this.preloadAsset(asset));
                await Promise.allSettled(promises);

                // Small delay between priority groups to prevent blocking
                if (priority !== AssetPriority.LOW) {
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            }
        }
    }

    // Add asset to viewport-based preloading queue
    static observeForPreloading(element: HTMLElement, assetUrl: string): void {
        this.initIntersectionObserver();

        element.dataset.preloadAsset = assetUrl;
        this.observer?.observe(element);
    }

    // Get asset loading state
    static getAssetState(asset: AssetConfig): AssetState {
        const assetKey = this.getAssetKey(asset);
        return this.loadedAssets.get(assetKey) || {
            url: asset.url,
            isLoading: false,
            isLoaded: false,
            hasError: false
        };
    }

    // Get preloading performance metrics
    static getPreloadingMetrics(): {
        totalAssets: number;
        loadedAssets: number;
        loadingAssets: number;
        failedAssets: number;
        averageLoadTime?: number;
        totalSize?: number;
    } {
        const states = Array.from(this.loadedAssets.values());
        const loadedStates = states.filter(state => state.isLoaded && state.loadTime);

        return {
            totalAssets: states.length,
            loadedAssets: loadedStates.length,
            loadingAssets: this.loadingPromises.size,
            failedAssets: states.filter(state => state.hasError).length,
            averageLoadTime: loadedStates.length > 0
                ? loadedStates.reduce((sum, state) => sum + (state.loadTime || 0), 0) / loadedStates.length
                : undefined,
            totalSize: loadedStates.reduce((sum, state) => sum + (state.size || 0), 0)
        };
    }

    // Preload critical application assets
    static async preloadCriticalAssets(): Promise<void> {
        const criticalAssets: AssetConfig[] = [
            // Critical CSS and fonts
            {
                url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
                type: AssetType.STYLE,
                priority: AssetPriority.CRITICAL,
                as: 'style',
                preload: true
            },
            // Critical JavaScript bundles (if any external)
            // Add more critical assets as needed
        ];

        await this.preloadAssets(criticalAssets);
    }

    // Smart image preloading based on user behavior
    static async preloadImagesForRoute(images: string[], priority: AssetPriority = AssetPriority.HIGH): Promise<void> {
        const imageAssets: AssetConfig[] = images.map(url => ({
            url,
            type: AssetType.IMAGE,
            priority,
            as: 'image',
            preload: true
        }));

        await this.preloadAssets(imageAssets);
    }
}

// React hook for asset preloading state
export function useAssetPreloading(assets: AssetConfig[]) {
    const [states, setStates] = useState<Map<string, AssetState>>(new Map());

    useEffect(() => {
        const updateStates = () => {
            const newStates = new Map<string, AssetState>();
            assets.forEach(asset => {
                newStates.set(asset.url, AssetPreloader.getAssetState(asset));
            });
            setStates(newStates);
        };

        updateStates();

        // Monitor asset loading
        const interval = setInterval(updateStates, 100);

        return () => clearInterval(interval);
    }, [assets]);

    const preloadAssets = useCallback(async () => {
        await AssetPreloader.preloadAssets(assets);
    }, [assets]);

    return { states, preloadAssets };
}

// Component for declarative asset preloading
interface AssetPreloaderProps {
    assets: AssetConfig[];
    children?: React.ReactNode;
    priority?: AssetPriority;
}

export function AssetPreloaderComponent({
    assets,
    children,
    priority = AssetPriority.MEDIUM
}: AssetPreloaderProps) {
    const { states, preloadAssets } = useAssetPreloading(assets);

    useEffect(() => {
        // Auto-preload assets when priority is critical or high
        if (priority === AssetPriority.CRITICAL || priority === AssetPriority.HIGH) {
            preloadAssets();
        }
    }, [preloadAssets, priority]);

    return <>{children}</>;
}

// Utility functions for common preloading scenarios
export const AssetPreloadingUtils = {
    // Preload images for a product gallery
    preloadProductImages: (images: string[], startIndex: number = 0, count: number = 3) => {
        const imagesToPreload = images.slice(startIndex, startIndex + count);
        return AssetPreloader.preloadImagesForRoute(imagesToPreload, AssetPriority.HIGH);
    },

    // Preload assets for route transitions
    preloadRouteAssets: (assets: AssetConfig[]) => {
        return AssetPreloader.preloadAssets(assets);
    },

    // Observe image elements for lazy preloading
    observeImagesForPreloading: (images: NodeListOf<HTMLImageElement>) => {
        images.forEach(img => {
            if (img.dataset.src) {
                AssetPreloader.observeForPreloading(img, img.dataset.src);
            }
        });
    },

    // Get preloading performance metrics
    getMetrics: () => AssetPreloader.getPreloadingMetrics(),

    // Preload critical app assets
    preloadCritical: () => AssetPreloader.preloadCriticalAssets()
};

// Initialize asset preloading on app start
export function initializeAssetPreloading(): void {
    if (typeof window === 'undefined') return;

    // Preload critical assets
    AssetPreloader.preloadCriticalAssets();

    // Add resource hints for common domains
    const addResourceHint = (rel: string, href: string, crossOrigin?: string) => {
        if (document.querySelector(`link[rel="${rel}"][href="${href}"]`)) {
            return; // Already exists
        }

        const link = document.createElement('link');
        link.rel = rel;
        link.href = href;
        if (crossOrigin) {
            link.crossOrigin = crossOrigin;
        }
        document.head.appendChild(link);
    };

    // Add preconnect hints for better performance
    addResourceHint('preconnect', 'https://fonts.googleapis.com');
    addResourceHint('preconnect', 'https://fonts.gstatic.com', 'anonymous');
    addResourceHint('preconnect', 'https://images.unsplash.com');
    addResourceHint('preconnect', 'https://cdn.jsdelivr.net');
}