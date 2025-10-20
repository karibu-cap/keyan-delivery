"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    Package,
    DollarSign,
    Navigation,
} from "lucide-react";
import { useOrderStatus } from "@/hooks/use-order-status";
import { Truck } from "lucide-react";
import { OrderStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/router";
import { useDriverOrders } from "@/hooks/use-driver-orders";
import { useWallet } from "@/hooks/use-wallet";

interface Order {
    id: string;
    status: OrderStatus;
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

interface DriverOrderCardProps {
    order: Order;
    isActive?: boolean;
}

export function DriverOrderCard({
    order,
    isActive = false,
}: DriverOrderCardProps) {
    const [pickupCode, setPickupCode] = useState("");
    const [deliveryCode, setDeliveryCode] = useState("");
    const router = useRouter();

    const { refreshOrders } = useDriverOrders();
    const { refreshWallet } = useWallet();

    const { loading, acceptOrder, startDelivery, completeDelivery } = useOrderStatus({
        redirectOnComplete: false,
        onOrderUpdate: () => {
            // Refresh orders after successful action
            setPickupCode("");
            setDeliveryCode("");
            refreshOrders();
            refreshWallet();
        }
    });

    const handleViewOrderDetails = (orderId: string) => {
        router.push(ROUTES.driverOrderDetails(orderId));
    };

    const handleAcceptOrder = async () => {
        if (!pickupCode.trim()) return;
        await acceptOrder(order.id, pickupCode);
        setPickupCode("");
    };

    const handleCompleteDelivery = async () => {
        if (!deliveryCode.trim()) return;
        await completeDelivery(order.id, deliveryCode);
        setDeliveryCode("");
    };
return (
    <Card className="p-6 rounded-2xl shadow-card hover:shadow-lg transition-all flex flex-col h-full">
        <div className="flex flex-col flex-1">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-lg">{order.merchant.businessName}</h3>
                    <p className="text-sm text-muted-foreground">
                        Order #{order.id.slice(-6)}
                    </p>
                </div>
                <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "Active" : "Available"}
                </Badge>
            </div>

            {/* Order Details - Simplified */}
            <div className="space-y-3 mb-4">
                {/* Items Count */}
                <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{order.items.length} items</span>
                </div>

                {/* Driver Earnings - Highlighted */}
                <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-success" />
                        <span className="text-sm font-medium text-success">Your Earnings</span>
                    </div>
                    <span className="text-lg font-bold text-success">
                        ${order.orderPrices.deliveryFee.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Delivery Address */}
            <div className="flex items-start gap-2 p-3 bg-accent/50 rounded-lg mb-4">
                <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Delivery to:</p>
                    <p className="text-sm text-muted-foreground truncate">
                        {order.deliveryInfo.address}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Contact: {order.deliveryInfo.deliveryContact}
                    </p>
                </div>
            </div>

            {/* Content area that grows to fill space */}
            <div className="flex-1 flex flex-col justify-end">
                {/* Status-specific content (when applicable) */}
                {isActive && (
                    <div className="space-y-3 mb-4">
                        {order.status === OrderStatus.ACCEPTED_BY_DRIVER && (
                            <p className="text-sm text-center text-muted-foreground">
                                Pickup Code: <span className="font-mono font-bold text-foreground">{order.pickupCode}</span>
                            </p>
                        )}

                        {order.status === OrderStatus.ON_THE_WAY && (
                            <div>
                                <Label htmlFor={`delivery-${order.id}`} className="text-sm mb-1">
                                    Enter Delivery Code
                                </Label>
                                <Input
                                    id={`delivery-${order.id}`}
                                    placeholder="Enter code from customer"
                                    value={deliveryCode}
                                    onChange={(e) => setDeliveryCode(e.target.value.toUpperCase())}
                                    className="uppercase"
                                />
                            </div>
                        )}

                        {order.status === OrderStatus.COMPLETED && (
                            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-sm font-medium text-green-800">Order Completed</p>
                                <p className="text-xs text-green-600 mt-1">Delivery successful!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Input field for available orders */}
                {!isActive && (
                    <div className="mb-4">
                        <Label htmlFor={`pickup-${order.id}`} className="text-sm mb-1">
                            Enter Pickup Code
                        </Label>
                        <Input
                            id={`pickup-${order.id}`}
                            placeholder="Enter code from merchant"
                            value={pickupCode}
                            onChange={(e) => setPickupCode(e.target.value.toUpperCase())}
                            className="uppercase"
                        />
                    </div>
                )}
            </div>

            {/* Action Buttons - Always at bottom with consistent spacing */}
            <div className="space-y-3 mt-auto">
                {/* Primary action buttons */}
                {!isActive ? (
                    <Button
                        className="w-full rounded-2xl"
                        onClick={handleAcceptOrder}
                        disabled={loading || !pickupCode.trim()}
                    >
                        {loading ? "Processing..." : "Accept Order"}
                    </Button>
                ) : (
                    <>
                        {order.status === OrderStatus.ACCEPTED_BY_DRIVER && (
                            <Button
                                className="w-full rounded-2xl"
                                onClick={() => startDelivery(order.id)}
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                ) : (
                                    <Truck className="w-4 h-4 mr-2" />
                                )}
                                Start Delivery
                            </Button>
                        )}

                        {order.status === OrderStatus.ON_THE_WAY && (
                            <Button
                                className="w-full rounded-2xl"
                                onClick={handleCompleteDelivery}
                                disabled={loading || !deliveryCode.trim()}
                            >
                                {loading ? "Processing..." : "Complete Delivery"}
                            </Button>
                        )}
                    </>
                )}

                {/* View Details button - Always present for all orders */}
                <Button
                    variant="outline"
                    className="w-full rounded-2xl"
                    onClick={() => handleViewOrderDetails(order.id)}
                >
                    <Navigation className="w-4 h-4 mr-2" />
                    View Details
                </Button>
            </div>
        </div>
    </Card>
);
}