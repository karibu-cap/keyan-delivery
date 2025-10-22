// File: /components/driver/DriverDashboardClient.tsx
// Futuristic driver dashboard with real-time data hydration and professional animations

"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Package, Truck, CheckCircle2, TrendingUp } from 'lucide-react';
import { useDriverOrders } from '@/hooks/use-driver-orders';
import DriverOrdersList from './DriverOrdersList';
import DriverStatsGrid from './DriverStatsGrid';

export default function DriverDashboardClient() {
    const { availableOrders, inProgressOrders, completedOrders, loading, error, refreshOrders } = useDriverOrders();
    const [activeTab, setActiveTab] = useState('available');
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const previousCountsRef = React.useRef({ available: 0, active: 0, completed: 0 });

    // Auto-refresh data every 30 seconds (silent refresh, no skeleton)
    useEffect(() => {
        const interval = setInterval(() => {
            refreshOrders();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [refreshOrders]);

    // Initial load
    useEffect(() => {
        refreshOrders();
        setTimeout(() => setIsInitialLoad(false), 1000);
    }, [refreshOrders]);

    // Auto-redirect to appropriate tab when order status changes
    useEffect(() => {
        if (isInitialLoad) return;

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
    }, [availableOrders.length, inProgressOrders.length, completedOrders.length, isInitialLoad]);

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
                    loading={loading}
                    onTabChange={setActiveTab}
                    isInitialLoad={isInitialLoad}
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
                        <DriverOrdersList
                            orders={availableOrders}
                            loading={loading}
                            error={error}
                            emptyTitle="No Available Orders"
                            emptyDescription="Check back later for new delivery opportunities"
                            type="available"
                            onRefresh={refreshOrders}
                            isInitialLoad={isInitialLoad}
                        />
                    </TabsContent>

                    <TabsContent value="active" className="space-y-4 mt-6">
                        <DriverOrdersList
                            orders={inProgressOrders}
                            loading={loading}
                            error={error}
                            emptyTitle="No Active Deliveries"
                            emptyDescription="Accept an order to start delivering"
                            type="active"
                            onRefresh={refreshOrders}
                            isInitialLoad={isInitialLoad}
                        />
                    </TabsContent>

                    <TabsContent value="completed" className="space-y-4 mt-6">
                        <DriverOrdersList
                            orders={completedOrders}
                            loading={loading}
                            error={error}
                            emptyTitle="No Completed Deliveries"
                            emptyDescription="Completed deliveries will appear here"
                            type="completed"
                            onRefresh={refreshOrders}
                            isInitialLoad={isInitialLoad}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
