'use client';

import React, { useEffect } from 'react';
import { AssetConfig, AssetPriority, AssetType } from '@/lib/asset-preloading';

// Asset preloading utilities (inline implementation)
const AssetPreloadingUtils = {
    preloadRouteAssets: (assets: AssetConfig[]) => {
        assets.forEach(asset => {
            if (asset.type === AssetType.IMAGE && asset.preload) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = asset.as || 'image';
                link.href = asset.url;
                document.head.appendChild(link);
            }
        });
    },

    observeImagesForPreloading: (elements: NodeListOf<HTMLImageElement>) => {
        // Implementation would observe elements for viewport intersection
        console.log('Observing images for preloading');
    },

    preloadProductImages: (images: string[], startIndex = 0, count = 3) => {
        return images.slice(startIndex, startIndex + count).map(url => ({
            url,
            type: AssetType.IMAGE,
            priority: AssetPriority.HIGH,
            as: 'image',
            preload: true
        }));
    },

    getMetrics: () => ({
        totalAssets: 0,
        loadedAssets: 0,
        loadingAssets: 0,
        failedAssets: 0,
        averageLoadTime: 0
    })
};

interface SmartAssetPreloaderProps {
    assets: AssetConfig[];
    children?: React.ReactNode;
    priority?: AssetPriority;
    trigger?: 'immediate' | 'viewport' | 'hover' | 'focus';
    threshold?: number;
}

export function SmartAssetPreloader({
    assets,
    children,
    priority = AssetPriority.MEDIUM,
    trigger = 'immediate',
    threshold = 0.1
}: SmartAssetPreloaderProps) {
    useEffect(() => {
        if (trigger === 'immediate') {
            // Preload assets immediately
            AssetPreloadingUtils.preloadRouteAssets(assets);
        }
    }, [assets, trigger]);

    const handleViewportPreload = () => {
        if (trigger === 'viewport') {
            // This would be used with intersection observer
            const elements = document.querySelectorAll('[data-preload-asset]');
            AssetPreloadingUtils.observeImagesForPreloading(elements as NodeListOf<HTMLImageElement>);
        }
    };

    const handleHoverPreload = () => {
        if (trigger === 'hover') {
            AssetPreloadingUtils.preloadRouteAssets(assets);
        }
    };

    return (
        <div
            onMouseEnter={trigger === 'hover' ? handleHoverPreload : undefined}
            onFocus={trigger === 'focus' ? handleHoverPreload : undefined}
            ref={trigger === 'viewport' ? handleViewportPreload : undefined}
        >
            <div>
                {children}
            </div>
        </div>
    );
}

// Hook for programmatic asset preloading
export function useSmartAssetPreloading() {
    const preloadProductImages = (images: string[], priority: AssetPriority = AssetPriority.HIGH) => {
        return AssetPreloadingUtils.preloadProductImages(images, 0, 3);
    };

    const preloadRouteAssets = (assets: AssetConfig[]) => {
        return AssetPreloadingUtils.preloadRouteAssets(assets);
    };

    const getMetrics = () => {
        return AssetPreloadingUtils.getMetrics();
    };

    return {
        preloadProductImages,
        preloadRouteAssets,
        getMetrics
    };
}

// Predefined asset configurations for common use cases
export const CommonAssetConfigs = {
    // Product gallery images
    productGallery: (images: string[]): AssetConfig[] => [
        ...images.slice(0, 3).map((url, index) => ({
            url,
            type: AssetType.IMAGE,
            priority: (index === 0 ? AssetPriority.HIGH : AssetPriority.MEDIUM),
            as: 'image',
            preload: true
        }))
    ],

    // Store hero images
    storeHero: (heroImage: string): AssetConfig[] => [
        {
            url: heroImage,
            type: AssetType.IMAGE,
            priority: AssetPriority.CRITICAL,
            as: 'image',
            preload: true
        }
    ],

    // Category icons
    categoryIcons: (icons: string[]): AssetConfig[] => [
        ...icons.map(url => ({
            url,
            type: AssetType.IMAGE,
            priority: AssetPriority.HIGH,
            as: 'image',
            preload: true
        }))
    ],

    // Cart/checkout assets
    checkoutAssets: (): AssetConfig[] => [
        {
            url: '/images/checkout/secure-payment.svg',
            type: AssetType.IMAGE,
            priority: AssetPriority.HIGH,
            as: 'image',
            preload: true
        }
    ]
};

// Performance monitoring component
export function AssetPreloadingMonitor() {
    const [metrics, setMetrics] = React.useState(AssetPreloadingUtils.getMetrics());
    const [isVisible, setIsVisible] = React.useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(AssetPreloadingUtils.getMetrics());
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded text-xs opacity-50 hover:opacity-100"
            >
                📊
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg text-xs max-w-sm">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">Asset Preloading</h4>
                <button onClick={() => setIsVisible(false)}>×</button>
            </div>
            <div className="space-y-1">
                <div>Total: {metrics.totalAssets}</div>
                <div>Loaded: {metrics.loadedAssets}</div>
                <div>Loading: {metrics.loadingAssets}</div>
                <div>Failed: {metrics.failedAssets}</div>
                {metrics.averageLoadTime && (
                    <div>Avg Load: {metrics.averageLoadTime.toFixed(2)}ms</div>
                )}
            </div>
        </div>
    );
}

// Higher-order component for adding preloading to existing components
export function withAssetPreloading<P extends object>(
    Component: React.ComponentType<P>,
    assets: AssetConfig[] | ((props: P) => AssetConfig[]),
    options: {
        priority?: AssetPriority;
        trigger?: 'immediate' | 'viewport' | 'hover' | 'focus';
    } = {}
) {
    return function WithAssetPreloadingComponent(props: P) {
        const assetList = typeof assets === 'function' ? assets(props) : assets;

        return (
            <SmartAssetPreloader
                assets={assetList}
                priority={options.priority}
                trigger={options.trigger}
            >
                <Component {...props} />
            </SmartAssetPreloader>
        );
    };
}