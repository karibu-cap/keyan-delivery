// File: /components/driver/DriverOrderCardGlass.tsx
// Design 3: Glassmorphism - Effet verre dépoli, gradients, style futuriste

"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Package, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { useOrderStatus } from "@/hooks/use-order-status";
import { OrderStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/router";
import { useDriverOrders } from "@/hooks/use-driver-orders";
import { useWallet } from "@/hooks/use-wallet";
import { useT } from "@/hooks/use-inline-translation";
import { Order } from "@/lib/models/order";
import { formatOrderId, getOrderDriverFee } from "@/lib/orders-utils";


interface DriverOrderCardGlassProps {
    order: Order;
    isActive?: boolean;
}

export function DriverOrderCardGlass({
    order,
    isActive = false,
}: DriverOrderCardGlassProps) {
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
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-purple-500/10 to-blue-500/10 dark:from-red-600/20 dark:via-purple-600/20 dark:to-blue-600/20" />
            
            {/* Glass Effect */}
            <div className="absolute inset-0 backdrop-blur-xl bg-white/60 dark:bg-gray-900/60" />
            
            {/* Animated Border Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ padding: '2px', borderRadius: 'inherit' }}>
                <div className="w-full h-full bg-white dark:bg-gray-900 rounded-[inherit]" />
            </div>

            {/* Content */}
            <div className="relative z-10 p-4 space-y-3">
                {/* Header with Sparkle */}
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                            <h3 className="font-bold text-sm truncate">
                                {order.merchant.businessName}
                            </h3>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Order {formatOrderId(order.id)}
                        </p>
                    </div>
                    <Badge className="bg-gradient-to-r from-red-600 to-pink-600 text-white border-0 shadow-lg">
                        {order.items.length} items
                    </Badge>
                </div>

                {/* Earnings - Glassmorphic Card */}
                <div className="relative overflow-hidden rounded-2xl p-4 backdrop-blur-sm bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-400/20 rounded-full blur-2xl" />
                    <div className="relative">
                        <p className="text-xs text-green-700 dark:text-green-300 mb-1 flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            Your Earnings
                        </p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            {t.formatAmount(getOrderDriverFee(order.orderPrices))}
                        </p>
                    </div>
                </div>

                {/* Delivery Info - Glassmorphic */}
                <div className="relative overflow-hidden rounded-xl p-3 backdrop-blur-sm bg-white/40 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700/50">
                    <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground mb-0.5">Deliver to</p>
                            <p className="text-sm font-semibold line-clamp-2">
                                {order.deliveryInfo.address}
                            </p>
                            {order.deliveryInfo.deliveryContact && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    📞 {order.deliveryInfo.deliveryContact}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Input & Action */}
                <div className="space-y-2 pt-2">
                    {!isActive && (
                        <>
                            <Input
                                placeholder="PICKUP CODE"
                                value={pickupCode}
                                onChange={(e) => setPickupCode(e.target.value.toUpperCase())}
                                className="text-center font-mono font-bold uppercase bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-white/60 dark:border-gray-700/60"
                            />
                            <Button
                                onClick={handleAcceptOrder}
                                disabled={isAccepting || !pickupCode.trim()}
                                className="w-full h-11 font-semibold rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                {isAccepting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Processing...
                                    </div>
                                ) : (
                                    "Accept Order"
                                )}
                            </Button>
                        </>
                    )}

                    {isActive && order.status === OrderStatus.ACCEPTED_BY_DRIVER && (
                        <>
                            <div className="text-center py-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                                <p className="text-xs text-muted-foreground">Pickup Code</p>
                                <p className="text-lg font-mono font-bold">{order.pickupCode}</p>
                            </div>
                            <Button
                                onClick={handleStartDelivery}
                                disabled={isStarting}
                                className="w-full h-11 font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                {isStarting ? "Starting..." : "Start Delivery"}
                            </Button>
                        </>
                    )}

                    {isActive && order.status === OrderStatus.ON_THE_WAY && (
                        <>
                            <Input
                                placeholder="DELIVERY CODE"
                                value={deliveryCode}
                                onChange={(e) => setDeliveryCode(e.target.value.toUpperCase())}
                                className="text-center font-mono font-bold uppercase bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-white/60 dark:border-gray-700/60"
                            />
                            <Button
                                onClick={handleCompleteDelivery}
                                disabled={isCompleting || !deliveryCode.trim()}
                                className="w-full h-11 font-semibold rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                {isCompleting ? "Processing..." : "Complete Delivery"}
                            </Button>
                        </>
                    )}

                    {order.status === OrderStatus.COMPLETED && (
                        <div className="text-center py-3 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                            <p className="text-sm font-semibold text-green-600">Delivered Successfully</p>
                        </div>
                    )}

                    <button
                        onClick={handleViewDetails}
                        className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 py-1.5 hover:bg-white/30 dark:hover:bg-gray-800/30 rounded-lg"
                    >
                        View Details
                        <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </Card>
    );
}
