"use client";

import React from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<ErrorFallbackProps>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export interface ErrorFallbackProps {
    error?: Error;
    resetError: () => void;
    clearError: () => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error,
            errorInfo,
        });

        // Call optional error handler
        this.props.onError?.(error, errorInfo);

        // Report error to monitoring service (e.g., Sentry)
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'exception', {
                description: error.toString(),
                fatal: false,
            });
        }
    }

    resetError = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    clearError = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    render() {
        if (this.state.hasError) {
            const FallbackComponent = this.props.fallback || DefaultErrorFallback;
            return (
                <FallbackComponent
                    error={this.state.error}
                    resetError={this.resetError}
                    clearError={this.clearError}
                />
            );
        }

        return this.props.children;
    }
}

// Default error fallback component
export function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
    const handleRetry = () => {
        resetError();
        // Optionally reload the page
        window.location.reload();
    };

    const handleGoHome = () => {
        window.location.href = '/';
    };

    const handleGoBack = () => {
        window.history.back();
    };

    return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-red-900">Something went wrong</CardTitle>
                    <CardDescription>
                        We encountered an unexpected error. Please try refreshing the page or go back.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Error details (only in development) */}
                    {process.env.NODE_ENV === 'development' && error && (
                        <details className="text-sm">
                            <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                                Error details
                            </summary>
                            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                                {error.toString()}
                            </pre>
                        </details>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button onClick={handleRetry} className="flex-1">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>

                        <Button variant="outline" onClick={handleGoBack} className="flex-1">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </Button>
                    </div>

                    <Button variant="ghost" onClick={handleGoHome} className="w-full">
                        <Home className="w-4 h-4 mr-2" />
                        Go to Homepage
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

// Hook for handling async errors in functional components
export function useErrorHandler() {
    return (error: Error) => {
        console.error('Async error caught:', error);
        throw error;
    };
}

// Higher-order component for error boundaries
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: React.ComponentType<ErrorFallbackProps>
) {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary fallback={fallback}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

    return WrappedComponent;
}

// Specific error boundaries for different parts of the app
export function ProductErrorFallback({ resetError }: ErrorFallbackProps) {
    return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-primary mr-2" />
                <span className="text-red-800 font-medium">Failed to load products</span>
            </div>
            <Button
                onClick={resetError}
                variant="outline"
                size="sm"
                className="mt-2"
            >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
            </Button>
        </div>
    );
}

export function SearchErrorFallback({ resetError }: ErrorFallbackProps) {
    return (
        <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
            <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-yellow-800 font-medium">Search temporarily unavailable</span>
            </div>
            <Button
                onClick={resetError}
                variant="outline"
                size="sm"
                className="mt-2"
            >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Search
            </Button>
        </div>
    );
}

export function CartErrorFallback({ resetError }: ErrorFallbackProps) {
    return (
        <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
            <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                <span className="text-orange-800 font-medium">Cart temporarily unavailable</span>
            </div>
            <Button
                onClick={resetError}
                variant="outline"
                size="sm"
                className="mt-2"
            >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
            </Button>
        </div>
    );
}