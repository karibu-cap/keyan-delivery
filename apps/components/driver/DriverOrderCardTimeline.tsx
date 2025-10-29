// File: /components/driver/DriverOrderCardTimeline.tsx
// Design 2: Timeline Style - Étapes visuelles avec progress bar

"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Store, Home, CheckCircle, ArrowRight } from "lucide-react";
import { useOrderStatus } from "@/hooks/use-order-status";
import { OrderStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/router";
import { useDriverOrders } from "@/hooks/use-driver-orders";
import { useWallet } from "@/hooks/use-wallet";
import { useT } from "@/hooks/use-inline-translation";
import { cn } from "@/lib/utils";
import { Order } from '@/lib/models/order';
import { formatOrderId, getOrderDriverFee } from "@/lib/orders-utils";

interface DriverOrderCardTimelineProps {
    order: Order;
    isActive?: boolean;
}

export function DriverOrderCardTimeline({
    order,
    isActive = false,
}: DriverOrderCardTimelineProps) {
    const t = useT();
    const [pickupCode, setPickupCode] = useState("");
    const [deliveryCode, setDeliveryCode] = useState("");
    const [isAccepting, setIsAccepting] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const router = useRouter();

    const { silentRefresh } = useDriverOrders();
    const { refreshWallet } = useWallet();

    const { acceptOrder, startDelivery, completeDelivery } = useOrderStatus({
        redirectOnComplete: false,
        onOrderUpdate: async () => {
            setPickupCode("");
            setDeliveryCode("");
            setIsAccepting(false);
            setIsStarting(false);
            setIsCompleting(false);
            await silentRefresh();
            refreshWallet();
        }
    });

    const handleAcceptOrder = async () => {
        if (!pickupCode.trim() || isAccepting) return;
        setIsAccepting(true);
        try {
            await acceptOrder(order.id, pickupCode);
            setPickupCode("");
        } catch (error) {
            console.error('Error accepting order:', error);
        } finally {
            setIsAccepting(false);
        }
    };

    const handleStartDelivery = async () => {
        if (isStarting) return;
        setIsStarting(true);
        try {
            await startDelivery(order.id);
        } catch (error) {
            console.error('Error starting delivery:', error);
        } finally {
            setIsStarting(false);
        }
    };

    const handleCompleteDelivery = async () => {
        if (!deliveryCode.trim() || isCompleting) return;
        setIsCompleting(true);
        try {
            await completeDelivery(order.id, deliveryCode);
            setDeliveryCode("");
        } catch (error) {
            console.error('Error completing delivery:', error);
        } finally {
            setIsCompleting(false);
        }
    };

    const handleViewDetails = () => {
        router.push(ROUTES.driverOrdersDetails(order.id));
    };

    // Determine timeline progress
    const isAccepted = isActive && order.status !== OrderStatus.PENDING;
    const isOnTheWay = isActive && (order.status === OrderStatus.ON_THE_WAY || order.status === OrderStatus.COMPLETED);
    const isDelivered = order.status === OrderStatus.COMPLETED;

    return (
        <Card className="overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 transition-all duration-300">
            {/* Header */}
            <div className="px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-sm truncate flex-1">
                        {order.merchant.businessName}
                    </h3>
                    <Badge className="bg-red-600 text-white text-xs ml-2">
                        {t.formatAmount(getOrderDriverFee(order.orderPrices))}
                    </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                    {formatOrderId(order.id)} • {order.items.length} items
                </p>
            </div>

            {/* Timeline */}
            <div className="px-4 py-4 space-y-3">
                {/* Step 1: Pickup */}
                <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                            isAccepted
                                ? "bg-green-500 text-white scale-110"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                        )}>
                            {isAccepted ? <CheckCircle className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                        </div>
                        {!isDelivered && (
                            <div className={cn(
                                "w-0.5 h-8 transition-all duration-300",
                                isOnTheWay ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                            )} />
                        )}
                    </div>
                    <div className="flex-1 pt-1">
                        <p className="text-sm font-semibold">Pickup</p>
                        <p className="text-xs text-muted-foreground truncate">
                            {order.merchant.businessName}
                        </p>
                        {isAccepted && order.pickupCode && (
                            <Badge variant="outline" className="mt-1 text-xs">
                                Code: {order.pickupCode}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Step 2: Delivery */}
                <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                            isDelivered
                                ? "bg-green-500 text-white scale-110"
                                : isOnTheWay
                                    ? "bg-blue-500 text-white animate-pulse"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                        )}>
                            {isDelivered ? <CheckCircle className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                        </div>
                    </div>
                    <div className="flex-1 pt-1">
                        <p className="text-sm font-semibold">Delivery</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                            {order.deliveryInfo.address}
                        </p>
                        {order.deliveryInfo.deliveryContact && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                                📞 {order.deliveryInfo.deliveryContact}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Input & Action */}
            <div className="px-4 pb-4 space-y-2">
                {!isActive && (
                    <>
                        <Input
                            placeholder="Enter pickup code"
                            value={pickupCode}
                            onChange={(e) => setPickupCode(e.target.value.toUpperCase())}
                            className="text-center font-mono uppercase"
                        />
                        <Button
                            onClick={handleAcceptOrder}
                            disabled={isAccepting || !pickupCode.trim()}
                            className="w-full bg-primary hover:bg-red-700"
                        >
                            {isAccepting ? "Processing..." : "Accept Order"}
                        </Button>
                    </>
                )}

                {isActive && order.status === OrderStatus.ACCEPTED_BY_DRIVER && (
                    <Button
                        onClick={handleStartDelivery}
                        disabled={isStarting}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        {isStarting ? "Starting..." : "Start Delivery"}
                    </Button>
                )}

                {isActive && order.status === OrderStatus.ON_THE_WAY && (
                    <>
                        <Input
                            placeholder="Enter delivery code"
                            value={deliveryCode}
                            onChange={(e) => setDeliveryCode(e.target.value.toUpperCase())}
                            className="text-center font-mono uppercase"
                        />
                        <Button
                            onClick={handleCompleteDelivery}
                            disabled={isCompleting || !deliveryCode.trim()}
                            className="w-full bg-green-600 hover:bg-green-700"
                        >
                            {isCompleting ? "Processing..." : "Complete Delivery"}
                        </Button>
                    </>
                )}

                {order.status === OrderStatus.COMPLETED && (
                    <div className="text-center py-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                        <p className="text-sm font-medium text-green-600">Delivered Successfully</p>
                    </div>
                )}

                <button
                    onClick={handleViewDetails}
                    className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 py-1"
                >
                    View Details
                    <ArrowRight className="w-3 h-3" />
                </button>
            </div>
        </Card>
    );
}
