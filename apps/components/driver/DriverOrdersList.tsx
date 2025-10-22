// File: /components/driver/DriverOrdersList.tsx
// Orders list with skeleton loading and professional animations

"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DriverOrderCardGlass } from './DriverOrderCardGlass';
import { OrderStatus } from '@prisma/client';
import { Order } from '@/lib/models/order';

interface DriverOrdersListProps {
    orders: Order[];
    loading: boolean;
    error: string | null;
    emptyTitle: string;
    emptyDescription: string;
    type: 'available' | 'active' | 'completed';
    onRefresh: () => void;
    isInitialLoad?: boolean;
}

// Skeleton loader component
function OrderCardSkeleton({ index }: { index: number }) {
    return (
        <Card 
            className="shadow-card animate-in fade-in slide-in-from-bottom-4"
            style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'backwards',
            }}
        >
            <div className="p-6 space-y-4 animate-pulse">
                {/* Header skeleton */}
                <div className="flex items-center justify-between">
                    <div className="h-6 bg-muted rounded w-32" />
                    <div className="h-6 bg-muted rounded-full w-20" />
                </div>

                {/* Content skeleton */}
                <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-5/6" />
                </div>

                {/* Footer skeleton */}
                <div className="flex items-center justify-between pt-4 border-t">
                    <div className="h-8 bg-muted rounded w-24" />
                    <div className="h-10 bg-muted rounded w-32" />
                </div>
            </div>
        </Card>
    );
}

// Empty state component
function EmptyState({ title, description, icon: Icon = AlertCircle }: { 
    title: string; 
    description: string; 
    icon?: React.ComponentType<{ className?: string }>;
}) {
    return (
        <Card className="shadow-card animate-in fade-in zoom-in-95 duration-300">
            <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4 animate-pulse">
                    <Icon className="w-8 h-8 text-muted-foreground animate-bounce" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                    {description}
                </p>
            </div>
        </Card>
    );
}

// Error state component
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
    return (
        <Card className="shadow-card border-destructive/50 animate-in fade-in zoom-in-95 duration-300">
            <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                    <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-destructive">Error Loading Orders</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {error}
                </p>
                <Button
                    onClick={onRetry}
                    variant="outline"
                    className="gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </Button>
            </div>
        </Card>
    );
}

export default function DriverOrdersList({
    orders,
    loading,
    error,
    emptyTitle,
    emptyDescription,
    type,
    onRefresh,
    isInitialLoad = true,
}: DriverOrdersListProps) {
    // Show skeletons only on initial load, not on refresh
    if (loading && isInitialLoad) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <OrderCardSkeleton key={i} index={i} />
                ))}
            </div>
        );
    }

    // Show error state
    if (error) {
        return <ErrorState error={error} onRetry={onRefresh} />;
    }

    // Show empty state
    if (orders.length === 0) {
        return <EmptyState title={emptyTitle} description={emptyDescription} />;
    }

    // Show orders grid - 1 col on mobile, 3 on desktop
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order, index) => (
                <div
                    key={order.id}
                    className="animate-in fade-in slide-in-from-bottom-4"
                    style={{
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'backwards',
                    }}
                >
                    <DriverOrderCardGlass
                        order={order}
                        isActive={type === 'active'}
                    />
                </div>
            ))}
        </div>
    );
}
