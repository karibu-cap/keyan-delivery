// components/driver/LocationPermissionCard.tsx
// GPS permission request card with animated icon

"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';
import { cn } from '@/lib/utils';

interface LocationPermissionCardProps {
    onPermissionGranted: (position: GeolocationPosition) => void;
    onPermissionDenied?: () => void;
}

type PermissionState = 'idle' | 'requesting' | 'denied' | 'error' | 'unsupported';

export default function LocationPermissionCard({
    onPermissionGranted,
    onPermissionDenied,
}: LocationPermissionCardProps) {
    const t = useT();
    const [permissionState, setPermissionState] = useState<PermissionState>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const requestLocationPermission = async () => {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            setPermissionState('unsupported');
            setErrorMessage(t('Geolocation is not supported by your browser'));
            return;
        }

        setPermissionState('requesting');
        setErrorMessage('');

        try {
            // Request permission and get current position
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Permission granted
                    setPermissionState('idle');
                    onPermissionGranted(position);
                },
                (error) => {
                    // Permission denied or error
                    console.error('Geolocation error:', error);

                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            setPermissionState('denied');
                            setErrorMessage(t('Location permission denied. Please enable location access in your browser settings.'));
                            if (onPermissionDenied) onPermissionDenied();
                            break;
                        case error.POSITION_UNAVAILABLE:
                            setPermissionState('error');
                            setErrorMessage(t('Location information is unavailable. Please check your device settings.'));
                            break;
                        case error.TIMEOUT:
                            setPermissionState('error');
                            setErrorMessage(t('Location request timed out. Please try again.'));
                            break;
                        default:
                            setPermissionState('error');
                            setErrorMessage(t('An unknown error occurred while getting your location.'));
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        } catch (error) {
            console.error('Error requesting location:', error);
            setPermissionState('error');
            setErrorMessage(t('Failed to request location permission'));
        }
    };

    const handleRetry = () => {
        setPermissionState('idle');
        setErrorMessage('');
        requestLocationPermission();
    };

    return (
        <div className="py-8 flex items-start justify-center p-4">
            <Card className="max-w-md w-full shadow-xl border-2">
                <CardHeader className="text-center pb-4">
                    {/* Animated GPS Icon */}
                    <div className="mx-auto mb-4 relative">
                        <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
                        <div className={cn(
                            "relative w-20 h-20 rounded-full flex items-center justify-center",
                            "bg-gradient-to-br from-red-500 to-red-600",
                            "shadow-lg shadow-red-500/50",
                            "animate-pulse"
                        )}>
                            <MapPin className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <CardTitle className="text-2xl font-bold">
                        {permissionState === 'denied' || permissionState === 'error' || permissionState === 'unsupported'
                            ? t('Location Access Required')
                            : t('Enable Location')}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Description */}
                    {permissionState === 'idle' && (
                        <>
                            <p className="text-center text-muted-foreground">
                                {t('We need your location to assign you delivery orders and track your progress in real-time.')}
                            </p>

                            <div className="space-y-3 bg-accent/50 p-4 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-sm">{t('Real-time tracking')}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {t('Customers can see your location during delivery')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-sm">{t('Accurate distance calculation')}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {t('Get precise route information and earnings')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={requestLocationPermission}
                                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-6 text-lg"
                                size="lg"
                            >
                                <MapPin className="w-5 h-5 mr-2" />
                                {t('Enable Location')}
                            </Button>
                        </>
                    )}

                    {/* Requesting state */}
                    {permissionState === 'requesting' && (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                            </div>
                            <p className="text-muted-foreground">
                                {t('Requesting location permission...')}
                            </p>
                        </div>
                    )}

                    {/* Error states */}
                    {(permissionState === 'denied' || permissionState === 'error' || permissionState === 'unsupported') && (
                        <>
                            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-medium text-red-900 dark:text-red-100 text-sm mb-1">
                                            {permissionState === 'denied' && t('Permission Denied')}
                                            {permissionState === 'error' && t('Error')}
                                            {permissionState === 'unsupported' && t('Not Supported')}
                                        </p>
                                        <p className="text-red-700 dark:text-red-300 text-sm">
                                            {errorMessage}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {permissionState !== 'unsupported' && (
                                <>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <p className="font-medium text-foreground">{t('How to enable location:')}</p>
                                        <ol className="list-decimal list-inside space-y-1 ml-2">
                                            <li>{t('Click the lock icon in your browser address bar')}</li>
                                            <li>{t('Find "Location" in the permissions list')}</li>
                                            <li>{t('Change it to "Allow"')}</li>
                                            <li>{t('Refresh the page and try again')}</li>
                                        </ol>
                                    </div>

                                    <Button
                                        onClick={handleRetry}
                                        variant="outline"
                                        className="w-full"
                                        size="lg"
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        {t('Try Again')}
                                    </Button>
                                </>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
