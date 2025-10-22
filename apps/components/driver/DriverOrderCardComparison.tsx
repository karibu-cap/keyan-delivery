// File: /components/driver/DriverOrderCardComparison.tsx
// Component to display all 3 card designs side by side for comparison

"use client";

import React from 'react';
import { DriverOrderCardMinimalist } from './DriverOrderCardMinimalist';
import { DriverOrderCardTimeline } from './DriverOrderCardTimeline';
import { DriverOrderCardGlass } from './DriverOrderCardGlass';
import { Badge } from '@/components/ui/badge';

interface Order {
    id: string;
    status: any;
    createdAt: Date;
    pickupCode: string | null;
    deliveryCode: string | null;
    orderPrices: {
        total: number;
        deliveryFee: number;
    };
    deliveryInfo: {
        address: string;
        delivery_latitude: number;
        delivery_longitude: number;
        deliveryContact: string | null;
        additionalNotes?: string | null;
    };
    merchant: {
        businessName: string;
        address: {
            latitude: number;
            longitude: number;
        };
    };
    items: Array<{
        id: string;
        quantity: number;
        price: number;
        product: {
            title: string;
        };
    }>;
}

interface DriverOrderCardComparisonProps {
    order: Order;
    isActive?: boolean;
}

export function DriverOrderCardComparison({
    order,
    isActive = false,
}: DriverOrderCardComparisonProps) {
    return (
        <div className="space-y-6">
            {/* Design 1: Minimaliste */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Badge className="bg-blue-600">Design 1</Badge>
                    <h3 className="text-sm font-semibold">Minimaliste iOS-style 🍎</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                    Clean, épuré, focus sur l'essentiel. Style Apple moderne.
                </p>
                <DriverOrderCardMinimalist order={order} isActive={isActive} />
            </div>

            {/* Design 2: Timeline */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Badge className="bg-purple-600">Design 2</Badge>
                    <h3 className="text-sm font-semibold">Timeline Style 📍</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                    Étapes visuelles avec progress bar. Montre le parcours pickup → delivery.
                </p>
                <DriverOrderCardTimeline order={order} isActive={isActive} />
            </div>

            {/* Design 3: Glassmorphism */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Badge className="bg-gradient-to-r from-red-600 to-pink-600 border-0">Design 3</Badge>
                    <h3 className="text-sm font-semibold">Glassmorphism ✨</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                    Effet verre dépoli, gradients, style futuriste et moderne.
                </p>
                <DriverOrderCardGlass order={order} isActive={isActive} />
            </div>
        </div>
    );
}
