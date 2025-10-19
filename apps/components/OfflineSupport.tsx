"use client"

// Offline Support and Network Error Handling
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useT } from '@/hooks/use-inline-translation';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Offline context for global state management
interface OfflineContextType {
    isOnline: boolean;
    isOffline: boolean;
    connectionType: string | undefined;
    lastOnlineTime: Date | null;
    retryCount: number;
    maxRetries: number;
    retry: () => void;
    resetRetries: () => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function useOffline() {
    const context = useContext(OfflineContext);
    if (!context) {
        throw new Error('useOffline must be used within OfflineProvider');
    }
    return context;
}

// Offline provider component
export function OfflineProvider({ children }: { children: React.ReactNode }) {
    const t = useT()
    const [isOnline, setIsOnline] = useState(true);
    const [connectionType, setConnectionType] = useState<string>();
    const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;

    // Handle online/offline events
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setLastOnlineTime(new Date());
            setRetryCount(0);
            console.log(t('🔗 Connection restored'));
        };

        const handleOffline = () => {
            setIsOnline(false);
            console.log(t('📴 Connection lost'));
        };

        // Set initial state
        setIsOnline(navigator.onLine);
        setLastOnlineTime(navigator.onLine ? new Date() : null);

        // Listen for network changes
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Get connection type if available
        if ('connection' in navigator) {
            const connection = (navigator as any).connection;
            setConnectionType(connection?.effectiveType || 'unknown');

            connection?.addEventListener('change', () => {
                setConnectionType(connection.effectiveType);
            });
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const retry = useCallback(() => {
        if (retryCount < maxRetries) {
            setRetryCount(prev => prev + 1);
            // Trigger a retry event that components can listen to
            window.dispatchEvent(new CustomEvent('retry-connection'));
        }
    }, [retryCount, maxRetries]);

    const resetRetries = useCallback(() => {
        setRetryCount(0);
    }, []);

    const value: OfflineContextType = {
        isOnline,
        isOffline: !isOnline,
        connectionType,
        lastOnlineTime,
        retryCount,
        maxRetries,
        retry,
        resetRetries,
    };

    return (
        <OfflineContext.Provider value={value}>
            {children}
        </OfflineContext.Provider>
    );
}

// Offline indicator component
export function OfflineIndicator() {
    const { isOnline, connectionType, retry, retryCount, maxRetries } = useOffline();
    const t = useT()

    if (isOnline) {
        return (
            <div className="fixed bottom-4 right-4 z-50 bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                <span className="hidden sm:inline">
                    {connectionType === '4g' ? '4G' : connectionType || 'Online'}
                </span>
            </div>
        );
    }

    return (
        <div className="fixed top-4 right-4 z-50 bg-red-100 text-red-800 px-3 py-2 rounded-full text-sm flex items-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span className="hidden sm:inline">{t("Offline")}</span>
            {retryCount > 0 && (
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={retry}
                    className="h-6 px-2 text-xs"
                    disabled={retryCount >= maxRetries}
                >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    {t("Retry")} ({retryCount}/{maxRetries})
                </Button>
            )}
        </div>
    );
}

// Network error boundary for API failures
interface NetworkErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<NetworkErrorFallbackProps>;
    onRetry?: () => void;
}

interface NetworkErrorBoundaryState {
    hasNetworkError: boolean;
    error?: Error;
    retryCount: number;
}

interface NetworkErrorFallbackProps {
    error?: Error;
    retry: () => void;
    retryCount: number;
    maxRetries: number;
}

export class OfflineNetworkErrorBoundary extends React.Component<
    NetworkErrorBoundaryProps,
    NetworkErrorBoundaryState
> {
    private retryTimeoutId: NodeJS.Timeout | null = null;

    constructor(props: NetworkErrorBoundaryProps) {
        super(props);
        this.state = {
            hasNetworkError: false,
            retryCount: 0,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<NetworkErrorBoundaryState> {
        // Check if it's a network error
        if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
            return { hasNetworkError: true, error };
        }
        return {};
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Network error caught:', error, errorInfo);

        // Only handle network errors
        if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
            this.setState({ error });

            // Auto-retry after delay
            this.retryTimeoutId = setTimeout(() => {
                this.handleRetry();
            }, 2000);
        }
    }

    componentWillUnmount() {
        if (this.retryTimeoutId) {
            clearTimeout(this.retryTimeoutId);
        }
    }

    handleRetry = () => {
        if (this.state.retryCount < 3) {
            this.setState(prev => ({
                hasNetworkError: false,
                error: undefined,
                retryCount: prev.retryCount + 1,
            }));

            // Call optional retry handler
            this.props.onRetry?.();

            // Dispatch retry event
            window.dispatchEvent(new CustomEvent('network-retry'));
        }
    };

    render() {
        if (this.state.hasNetworkError) {
            const FallbackComponent = this.props.fallback || DefaultNetworkErrorFallback;
            return (
                <FallbackComponent
                    error={this.state.error}
                    retry={this.handleRetry}
                    retryCount={this.state.retryCount}
                    maxRetries={3}
                />
            );
        }

        return this.props.children;
    }
}

// Default network error fallback
function DefaultNetworkErrorFallback({ error, retry, retryCount, maxRetries }: NetworkErrorFallbackProps) {
    const t = useT()

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <WifiOff className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-orange-900">Connection Problem</CardTitle>
                <CardDescription>
                    {t("We are having trouble connecting to our servers. Please check your internet connection.")}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {process.env.NODE_ENV === 'development' && error && (
                    <details className="text-sm">
                        <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                            {t("Error details")}
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                            {error.toString()}
                        </pre>
                    </details>
                )}

                <div className="flex flex-col gap-2">
                    <Button
                        onClick={retry}
                        className="w-full"
                        disabled={retryCount >= maxRetries}
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {t("Try Again")} {retryCount > 0 && `(${retryCount}/${maxRetries})`}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                        className="w-full"
                    >
                        {t("Reload Page")}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// Offline page component
export function OfflinePage() {
    const { retry, retryCount, maxRetries } = useOffline();
    const t = useT()

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <WifiOff className="w-8 h-8 text-red-600" />
                    </div>
                    <CardTitle className="text-red-900">{t("You're Offline")}</CardTitle>
                    <CardDescription>
                        {t("Please check your internet connection and try again.")}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="text-center text-sm text-muted-foreground">
                        {t("You can still browse previously loaded content, but some features may not work.")}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button onClick={retry} className="w-full">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            {t("Try Again")} {retryCount > 0 && `(${retryCount}/${maxRetries})`}
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                            className="w-full"
                        >
                            {t("Reload Page")}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Service worker registration hook
export function useServiceWorker() {
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const [updateAvailable, setUpdateAvailable] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((reg) => {
                    setRegistration(reg);

                    // Check for updates
                    reg.addEventListener('updatefound', () => {
                        const newWorker = reg.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    setUpdateAvailable(true);
                                }
                            });
                        }
                    });

                    console.log('SW registered:', reg);
                })
                .catch((error) => {
                    console.error('SW registration failed:', error);
                });
        }
    }, []);

    const updateServiceWorker = useCallback(() => {
        if (registration && registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    }, [registration]);

    return { registration, updateAvailable, updateServiceWorker };
}

// Cache management utilities
export class OfflineCache {
    private static CACHE_NAME = 'Yetu-delivery-v1';

    static async cacheResources(resources: string[]): Promise<void> {
        if (typeof window !== 'undefined' && 'caches' in window) {
            try {
                const cache = await caches.open(this.CACHE_NAME);

                // Filter out already cached resources
                const uncachedResources = await Promise.all(
                    resources.map(async (resource) => {
                        const response = await cache.match(resource);
                        return response ? null : resource;
                    })
                );

                const validResources = uncachedResources.filter(Boolean) as string[];

                if (validResources.length > 0) {
                    await cache.addAll(validResources);
                    console.log(`Cached ${validResources.length} resources for offline use`);
                }
            } catch (error) {
                console.error('Failed to cache resources:', error);
            }
        }
    }

    static async getCachedResource(url: string): Promise<Response | undefined> {
        if (typeof window !== 'undefined' && 'caches' in window) {
            try {
                const cache = await caches.open(this.CACHE_NAME);
                return await cache.match(url);
            } catch (error) {
                console.error('Failed to get cached resource:', error);
            }
        }
        return undefined;
    }

    static async clearCache(): Promise<void> {
        if (typeof window !== 'undefined' && 'caches' in window) {
            try {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
                console.log('All caches cleared');
            } catch (error) {
                console.error('Failed to clear cache:', error);
            }
        }
    }

    static async getCacheSize(): Promise<number> {
        if (typeof window !== 'undefined' && 'caches' in window) {
            try {
                const cacheNames = await caches.keys();
                let totalSize = 0;

                for (const cacheName of cacheNames) {
                    const cache = await caches.open(cacheName);
                    const requests = await cache.keys();

                    for (const request of requests) {
                        const response = await cache.match(request);
                        if (response) {
                            const blob = await response.blob();
                            totalSize += blob.size;
                        }
                    }
                }

                return totalSize;
            } catch (error) {
                console.error('Failed to calculate cache size:', error);
            }
        }
        return 0;
    }
}

// Network status hook
export function useNetworkStatus() {
    const [status, setStatus] = useState<{
        isOnline: boolean;
        connectionType?: string;
        downlink?: number;
        rtt?: number;
    }>({
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    });

    useEffect(() => {
        const updateStatus = () => {
            setStatus({
                isOnline: navigator.onLine,
                connectionType: (navigator as any).connection?.effectiveType,
                downlink: (navigator as any).connection?.downlink,
                rtt: (navigator as any).connection?.rtt,
            });
        };

        updateStatus();

        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);

        if ((navigator as any).connection) {
            (navigator as any).connection.addEventListener('change', updateStatus);
        }

        return () => {
            window.removeEventListener('online', updateStatus);
            window.removeEventListener('offline', updateStatus);

            if ((navigator as any).connection) {
                (navigator as any).connection.removeEventListener('change', updateStatus);
            }
        };
    }, []);

    return status;
}

// Retry utility for failed requests
export async function retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<T> {
    let lastError: Error;

    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await requestFn();
        } catch (error) {
            lastError = error as Error;

            if (i === maxRetries) {
                throw lastError;
            }

            // Exponential backoff
            const waitTime = delay * Math.pow(2, i);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    throw lastError!;
}

// Offline queue for actions that should be performed when back online
export class OfflineQueue {
    private static queue: Array<{
        id: string;
        action: () => Promise<void>;
        timestamp: number;
    }> = [];

    private static isProcessing = false;

    static add(action: () => Promise<void>): string {
        const id = `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        this.queue.push({
            id,
            action,
            timestamp: Date.now(),
        });

        // Try to process if online
        if (navigator.onLine && !this.isProcessing) {
            this.process();
        }

        return id;
    }

    static async process(): Promise<void> {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;

        while (this.queue.length > 0 && navigator.onLine) {
            const item = this.queue.shift();
            if (!item) break;

            try {
                await item.action();
                console.log(`Processed offline action: ${item.id}`);
            } catch (error) {
                console.error(`Failed to process offline action: ${item.id}`, error);
                // Re-add to queue if failed
                this.queue.unshift(item);
                break;
            }
        }

        this.isProcessing = false;
    }

    static clear(): void {
        this.queue = [];
    }

    static getQueueSize(): number {
        return this.queue.length;
    }
}

// Listen for online events to process queue
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        OfflineQueue.process();
    });
}
