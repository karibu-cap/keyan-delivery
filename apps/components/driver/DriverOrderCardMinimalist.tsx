// File: /components/driver/DriverOrderCardMinimalist.tsx
// Design 1: Minimaliste iOS-style - Clean, épuré, focus sur l'essentiel

"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Package, ArrowRight, CheckCircle } from "lucide-react";
import { useOrderStatus } from "@/hooks/use-order-status";
import { OrderStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/router";
import { useDriverOrders } from "@/hooks/use-driver-orders";
import { useWallet } from "@/hooks/use-wallet";
import { useT } from "@/hooks/use-inline-translation";
import { Order } from '@/lib/models/order';
import { formatOrderId, getOrderDriverFee } from "@/lib/orders-utils";

interface DriverOrderCardMinimalistProps {
    order: Order;
    isActive?: boolean;
}

export function DriverOrderCardMinimalist({
    order,
    isActive = false,
}: DriverOrderCardMinimalistProps) {
    const t = useT();
    const [pickupCode, setPickupCode] = useState("");
    const [deliveryCode, setDeliveryCode] = useState("");
    const [isAccepting, setIsAccepting] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const router = useRouter();

    const { refreshOrders } = useDriverOrders();
    const { refreshWallet } = useWallet();

    const { acceptOrder, startDelivery, completeDelivery } = useOrderStatus({
        redirectOnComplete: false,
        onOrderUpdate: () => {
            setPickupCode("");
            setDeliveryCode("");
            setIsAccepting(false);
            setIsStarting(false);
            setIsCompleting(false);
            refreshOrders();
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
        router.push(ROUTES.driverOrderDetails(order.id));
    };

    return (
        <Card className="overflow-hidden bg-white dark:bg-gray-900 border-0 shadow-sm hover:shadow-md transition-all duration-300">
            {/* Header - Merchant Name */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base truncate flex-1">
                        {order.merchant.businessName}
                    </h3>
                    <Badge variant="outline" className="text-xs ml-2">
                        {order.items.length} items
                    </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Order {formatOrderId(order.id)}
                </p>
            </div>

            {/* Earnings - Big and centered */}
            <div className="px-4 py-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <p className="text-xs text-muted-foreground mb-1">Your Earnings</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {t.formatAmount(getOrderDriverFee(order.orderPrices))}
                </p>
            </div>

            {/* Delivery Address */}
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                            {order.deliveryInfo.address}
                        </p>
                        {order.deliveryInfo.deliveryContact && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {order.deliveryInfo.deliveryContact}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Input & Action */}
            <div className="px-4 pb-4 pt-3 space-y-3">
                {!isActive && (
                    <Input
                        placeholder="PICKUP CODE"
                        value={pickupCode}
                        onChange={(e) => setPickupCode(e.target.value.toUpperCase())}
                        className="text-center font-mono font-semibold text-lg uppercase border-2"
                    />
                )}

                {isActive && order.status === OrderStatus.ACCEPTED_BY_DRIVER && (
                    <div className="text-center py-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <p className="text-xs text-muted-foreground">Pickup Code</p>
                        <p className="text-lg font-mono font-bold">{order.pickupCode}</p>
                    </div>
                )}

                {isActive && order.status === OrderStatus.ON_THE_WAY && (
                    <Input
                        placeholder="DELIVERY CODE"
                        value={deliveryCode}
                        onChange={(e) => setDeliveryCode(e.target.value.toUpperCase())}
                        className="text-center font-mono font-semibold text-lg uppercase border-2"
                    />
                )}

                {/* Action Button */}
                {!isActive ? (
                    <Button
                        onClick={handleAcceptOrder}
                        disabled={isAccepting || !pickupCode.trim()}
                        className="w-full h-12 text-base font-semibold rounded-xl bg-red-600 hover:bg-red-700"
                    >
                        {isAccepting ? "Processing..." : "Accept Order"}
                    </Button>
                ) : (
                    <>
                        {order.status === OrderStatus.ACCEPTED_BY_DRIVER && (
                            <Button
                                onClick={handleStartDelivery}
                                disabled={isStarting}
                                className="w-full h-12 text-base font-semibold rounded-xl bg-blue-600 hover:bg-blue-700"
                            >
                                {isStarting ? "Starting..." : "Start Delivery"}
                            </Button>
                        )}

                        {order.status === OrderStatus.ON_THE_WAY && (
                            <Button
                                onClick={handleCompleteDelivery}
                                disabled={isCompleting || !deliveryCode.trim()}
                                className="w-full h-12 text-base font-semibold rounded-xl bg-green-600 hover:bg-green-700"
                            >
                                {isCompleting ? "Processing..." : "Complete Delivery"}
                            </Button>
                        )}

                        {order.status === OrderStatus.COMPLETED && (
                            <div className="text-center py-3 bg-green-50 dark:bg-green-950/20 rounded-xl">
                                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                                <p className="text-sm font-medium text-green-600">Completed</p>
                            </div>
                        )}
                    </>
                )}

                {/* View Details Link */}
                <button
                    onClick={handleViewDetails}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 py-2"
                >
                    View Details
                    <ArrowRight className="w-3 h-3" />
                </button>
            </div>
        </Card>
    );
}
