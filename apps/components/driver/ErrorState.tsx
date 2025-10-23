// components/driver/ErrorState.tsx
// Reusable error state component with retry functionality

"use client";

import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useT } from '@/hooks/use-inline-translation';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/router';

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    showBackButton?: boolean;
    isRetrying?: boolean;
}

export default function ErrorState({
    title,
    message,
    onRetry,
    showBackButton = true,
    isRetrying = false,
}: ErrorStateProps) {
    const t = useT();
    const router = useRouter();

    const handleBackToDashboard = () => {
        router.push(ROUTES.driverDashboard);
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                </div>

                <h2 className="text-xl font-semibold mb-2">
                    {title || t('Error Loading Data')}
                </h2>

                <p className="text-muted-foreground mb-6">
                    {message || t('We encountered an error while loading your data. Please check your internet connection and try again.')}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {onRetry && (
                        <Button
                            onClick={onRetry}
                            disabled={isRetrying}
                            className="gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                            {isRetrying ? t('Retrying...') : t('Retry')}
                        </Button>
                    )}

                    {showBackButton && (
                        <Button
                            variant="outline"
                            onClick={handleBackToDashboard}
                            className="gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {t('Back to Dashboard')}
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
}
