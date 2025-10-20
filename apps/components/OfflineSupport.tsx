"use client"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useT } from '@/hooks/use-inline-translation';
import { toast } from '@/hooks/use-toast';

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
            toast(
                { description: t('🔗 Connection restored') }
            )
        };

        const handleOffline = () => {
            setIsOnline(false);
            toast(
                { description: t('📴 Connection lost') }
            )
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
            <div className="fixed bottom-4 right-4 z-50 bg-primary/10 text-primary/80 px-3 py-2 rounded-full text-sm flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                <span className="hidden sm:inline">
                    {connectionType === '4g' ? '4G' : connectionType || 'Online'}
                </span>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-red-100 text-red-800 px-3 py-2 rounded-full text-sm flex items-center gap-2">
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
                <CardTitle className="text-orange-900">{t("Connection Problem")}</CardTitle>
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
