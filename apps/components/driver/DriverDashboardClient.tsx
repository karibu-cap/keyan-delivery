// File: /components/driver/DriverDashboardClient.tsx
// Futuristic driver dashboard with real-time data hydration and professional animations

"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Truck, CheckCircle2, TrendingUp } from 'lucide-react';
import { useDriverOrders } from '@/hooks/use-driver-orders';
import DriverOrdersList from './DriverOrdersList';
import DriverStatsGrid from './DriverStatsGrid';
import ErrorState from './ErrorState';
import LocationPermissionCard from './LocationPermissionCard';

export default function DriverDashboardClient() {
    const { availableOrders, inProgressOrders, completedOrders, loading: orderLoading, error, refreshOrders } = useDriverOrders();
    const [activeTab, setActiveTab] = useState('available');
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isRetrying, setIsRetrying] = useState(false);
    const [hasLocationPermission, setHasLocationPermission] = useState(false);
    const [isCheckingPermission, setIsCheckingPermission] = useState(true);
    const previousCountsRef = React.useRef({ available: 0, active: 0, completed: 0 });

    const handleRetry = async () => {
        setIsRetrying(true);
        setIsInitialLoad(true);
        await refreshOrders();
        setTimeout(() => {
            setIsInitialLoad(false);
            setIsRetrying(false);
        }, 1000);
    };

    // Check GPS permission on mount
    useEffect(() => {
        const checkPermission = async () => {
            if (!navigator.geolocation) {
                setIsCheckingPermission(false);
                return;
            }

            try {
                // Try to get permission status if supported
                if ('permissions' in navigator) {
                    const result = await navigator.permissions.query({ name: 'geolocation' });
                    
                    if (result.state === 'granted') {
                        setHasLocationPermission(true);
                    }
                    
                    // Listen for permission changes
                    result.addEventListener('change', () => {
                        setHasLocationPermission(result.state === 'granted');
                    });
                }
            } catch (error) {
                console.error('Error checking permission:', error);
            } finally {
                setIsCheckingPermission(false);
            }
        };

        checkPermission();
    }, []);

    // Auto-refresh data every 30 seconds (silent refresh, no skeleton)
    useEffect(() => {
        if (!hasLocationPermission) return;
        
        const interval = setInterval(() => {
            refreshOrders();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [refreshOrders, hasLocationPermission]);

    // Initial load
    useEffect(() => {
        if (!hasLocationPermission) return;
        
        refreshOrders();
        setTimeout(() => setIsInitialLoad(false), 1000);
    }, [refreshOrders, hasLocationPermission]);

    // Auto-redirect to appropriate tab when order status changes
    useEffect(() => {
        if (isInitialLoad || !hasLocationPermission) return;

        const currentCounts = {
            available: availableOrders.length,
            active: inProgressOrders.length,
            completed: completedOrders.length,
        };

        const prevCounts = previousCountsRef.current;

        // If an order moved from available to active (accepted)
        if (currentCounts.available < prevCounts.available && currentCounts.active > prevCounts.active) {
            setActiveTab('active');
        }

        // If an order moved from active to completed
        if (currentCounts.active < prevCounts.active && currentCounts.completed > prevCounts.completed) {
            setActiveTab('completed');
        }

        previousCountsRef.current = currentCounts;
    }, [availableOrders.length, inProgressOrders.length, completedOrders.length, isInitialLoad, hasLocationPermission]);

    // Handle permission granted
    const handlePermissionGranted = (position: GeolocationPosition) => {
        console.log('Location permission granted:', position);
        setHasLocationPermission(true);
    };

    // Handle permission denied
    const handlePermissionDenied = () => {
        console.log('Location permission denied');
        setHasLocationPermission(false);
    };

    // Show error state if initial load failed (only if we have location permission)
    const showErrorState = error && isInitialLoad && !orderLoading && hasLocationPermission;

    // Show skeleton while loading initial data
    if (isInitialLoad && orderLoading && !error) {
        return (
            <div className="min-h-screen">
                {/* Hero Skeleton */}
                <section className="gradient-hero py-8 sm:py-12 lg:py-16 px-4">
                    <div className="container mx-auto max-w-7xl">
                        <Skeleton className="h-8 w-48 bg-white/20" />
                        <Skeleton className="h-4 w-64 mt-2 bg-white/20" />
                    </div>
                </section>

                {/* Stats Cards Skeleton */}
                <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-6">
                    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="p-3 animate-pulse">
                                <Skeleton className="h-3 w-20 mb-2" />
                                <Skeleton className="h-5 w-12" />
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Tabs Skeleton */}
                <div className="container mx-auto max-w-7xl px-4 pb-12">
                    <Skeleton className="h-12 w-full rounded-xl mb-6" />
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="p-4 animate-pulse">
                                <Skeleton className="h-32 w-full" />
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Hero Section with Red Gradient */}
            <section className="gradient-hero py-8 sm:py-12 lg:py-16 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-white">
                        {/* Header Title */}
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white truncate flex items-center gap-3">
                                <Truck className="w-8 h-8" />
                                Orders Dashboard
                            </h1>
                            <p className="mt-1 sm:mt-2 text-sm text-white/90 truncate">
                                Manage your deliveries and track your earnings
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Grid */}
            <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-6">
                <DriverStatsGrid
                    availableCount={availableOrders.length}
                    activeCount={inProgressOrders.length}
                    completedCount={completedOrders.length}
                    loading={isInitialLoad && orderLoading}
                />
            </div>

            {/* Orders Tabs */}
            <div className="container mx-auto max-w-7xl px-4 pb-12">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50 backdrop-blur-sm rounded-xl p-1">
                        <TabsTrigger 
                            value="available" 
                            className="rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                        >
                            <Package className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Orders</span>
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-background/20 text-xs font-semibold">
                                {availableOrders.length}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="active"
                            className="rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                        >
                            <Truck className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Deliveries</span>
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-background/20 text-xs font-semibold">
                                {inProgressOrders.length}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="completed"
                            className="rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Completed</span>
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-background/20 text-xs font-semibold">
                                {completedOrders.length}
                            </span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="available" className="space-y-4 mt-6">
                        {isCheckingPermission ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                            </div>
                        ) : !hasLocationPermission ? (
                            <LocationPermissionCard
                                onPermissionGranted={handlePermissionGranted}
                                onPermissionDenied={handlePermissionDenied}
                            />
                        ) : showErrorState ? (
                            <ErrorState
                                title="Failed to Load Dashboard"
                                message="We couldn't load your orders. Please check your internet connection and try again."
                                onRetry={handleRetry}
                                showBackButton={false}
                                isRetrying={isRetrying}
                            />
                        ) : (
                            <DriverOrdersList
                                orders={availableOrders}
                                loading={orderLoading}
                                error={error}
                                emptyTitle="No Available Orders"
                                emptyDescription="Check back later for new delivery opportunities"
                                type="available"
                                onRefresh={refreshOrders}
                                isInitialLoad={isInitialLoad}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="active" className="space-y-4 mt-6">
                        {isCheckingPermission ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                            </div>
                        ) : !hasLocationPermission ? (
                            <LocationPermissionCard
                                onPermissionGranted={handlePermissionGranted}
                                onPermissionDenied={handlePermissionDenied}
                            />
                        ) : showErrorState ? (
                            <ErrorState
                                title="Failed to Load Dashboard"
                                message="We couldn't load your orders. Please check your internet connection and try again."
                                onRetry={handleRetry}
                                showBackButton={false}
                                isRetrying={isRetrying}
                            />
                        ) : (
                            <DriverOrdersList
                                orders={inProgressOrders}
                                loading={orderLoading}
                                error={error}
                                emptyTitle="No Active Deliveries"
                                emptyDescription="Accept an order to start delivering"
                                type="active"
                                onRefresh={refreshOrders}
                                isInitialLoad={isInitialLoad}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="completed" className="space-y-4 mt-6">
                        {isCheckingPermission ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                            </div>
                        ) : !hasLocationPermission ? (
                            <LocationPermissionCard
                                onPermissionGranted={handlePermissionGranted}
                                onPermissionDenied={handlePermissionDenied}
                            />
                        ) : showErrorState ? (
                            <ErrorState
                                title="Failed to Load Dashboard"
                                message="We couldn't load your orders. Please check your internet connection and try again."
                                onRetry={handleRetry}
                                showBackButton={false}
                                isRetrying={isRetrying}
                            />
                        ) : (
                            <DriverOrdersList
                                orders={completedOrders}
                                loading={orderLoading}
                                error={error}
                                emptyTitle="No Completed Deliveries"
                                emptyDescription="Completed deliveries will appear here"
                                type="completed"
                                onRefresh={refreshOrders}
                                isInitialLoad={isInitialLoad}
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
