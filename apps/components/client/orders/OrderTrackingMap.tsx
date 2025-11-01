"use client";

import { useEffect, useState, useMemo, memo } from "react";
import { Package, MapPin, Truck, Clock, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatus } from "@prisma/client";
import { useOrderTracking } from "@/hooks/use-order-tracking-query";
import { Order } from "@/lib/models/order";
import dynamic from "next/dynamic";

// Dynamically import the tracking map
const DriverTrackingMap = dynamic(
    () => import("@/components/driver/DriverTrackingMap"),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-[400px] rounded-2xl bg-accent animate-pulse" />
        ),
    }
);

interface OrderTrackingMapProps {
    orderId: string;
    initialStatus: OrderStatus;
}

function OrderTrackingMap({ orderId, initialStatus }: OrderTrackingMapProps) {
    const { trackingData, loading, error } = useOrderTracking({
        orderId,
        enabled: initialStatus === OrderStatus.ON_THE_WAY || initialStatus === OrderStatus.ACCEPTED_BY_DRIVER,
    });

    // Memoize expensive distance and time calculations - only recalculate when coordinates change
    const { distance, estimatedTime } = useMemo(() => {
        const order = trackingData as Order | null;
        if (!order?.driverCurrentLocation || !order?.deliveryInfo) {
            return { distance: 0, estimatedTime: '--:--' };
        }

        // Haversine formula to calculate distance between two points
        const R = 6371; // Earth's radius in km
        const dLat = (order.deliveryInfo.location.lat - order.driverCurrentLocation.latitude) * Math.PI / 180;
        const dLon = (order.deliveryInfo.location.lng - order.driverCurrentLocation.longitude) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((order.driverCurrentLocation.latitude * Math.PI) / 180) *
            Math.cos((order.deliveryInfo.location.lat * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km

        // Calculate ETA (assuming average speed of 30km/h)
        const hours = distance / 30;
        const minutes = Math.round(hours * 60);
        const displayHours = Math.floor(minutes / 60);
        const displayMinutes = minutes % 60;
        const estimatedTime = `${displayHours}:${displayMinutes < 10 ? '0' : ''}${displayMinutes}`;

        return {
            distance: distance.toFixed(1),
            estimatedTime
        };
    }, [
        trackingData?.driverCurrentLocation?.latitude,
        trackingData?.driverCurrentLocation?.longitude,
        trackingData?.deliveryInfo?.location?.lat,
        trackingData?.deliveryInfo?.location?.lng
    ]);

    if (loading && !trackingData) {
        return (
            <Card className="p-6 rounded-2xl">
                <Skeleton className="h-8 w-48 mb-4" />
                <Skeleton className="h-[400px] w-full rounded-2xl mb-4" />
                <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="p-6 rounded-2xl">
                <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Unable to load tracking information</p>
                </div>
            </Card>
        );
    }

    const getStatusInfo = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.ON_THE_WAY:
                return {
                    icon: Truck,
                    text: "Driver is on the way",
                    color: "text-blue-600",
                    bgColor: "bg-blue-50",
                };
            case OrderStatus.ACCEPTED_BY_DRIVER:
                return {
                    icon: Package,
                    text: "Driver is picking up your order",
                    color: "text-orange-600",
                    bgColor: "bg-orange-50",
                };
            case OrderStatus.COMPLETED:
                return {
                    icon: CheckCircle,
                    text: "Order delivered",
                    color: "text-green-600",
                    bgColor: "bg-green-50",
                };
            default:
                return {
                    icon: Clock,
                    text: "Preparing your order",
                    color: "text-gray-600",
                    bgColor: "bg-gray-50",
                };
        }
    };

    const order = trackingData as Order | null;
    const statusInfo = getStatusInfo(order?.status || initialStatus);
    const StatusIcon = statusInfo.icon;

    return (
        <div className="space-y-6">
            {/* Status Header */}
            <Card className={`p-6 rounded-2xl ${statusInfo.bgColor} border-2`}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${statusInfo.bgColor} flex items-center justify-center`}>
                        <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-lg font-semibold ${statusInfo.color}`}>
                            {statusInfo.text}
                        </h3>
                        {order?.status === OrderStatus.ON_THE_WAY && (
                            <p className="text-sm text-muted-foreground mt-1">
                                Estimated arrival: {estimatedTime}
                            </p>
                        )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                        {order?.status.replace(/_/g, " ").toLowerCase() || "Processing"}
                    </Badge>
                </div>
            </Card>

            {/* Map Section */}
            {(order?.status === OrderStatus.ON_THE_WAY ||
                order?.status === OrderStatus.ACCEPTED_BY_DRIVER) && order && (
                    <Card className="p-4 sm:p-6 rounded-2xl shadow-card">
                        <div className="mb-4">
                            <h2 className="text-lg sm:text-xl font-semibold">Live Tracking</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Follow your driver in real-time
                            </p>
                        </div>

                        {/* Map */}
                        <div className="relative w-full h-[400px] rounded-2xl overflow-hidden">
                            <DriverTrackingMap
                                orderStatus={order.status}
                                driverLocation={
                                    order.driverCurrentLocation
                                        ? {
                                            latitude: order.driverCurrentLocation.latitude,
                                            longitude: order.driverCurrentLocation.longitude,
                                        }
                                        : null
                                }
                                merchantLocation={
                                    order.merchant.address
                                        ? {
                                            latitude: order.merchant.address.latitude,
                                            longitude: order.merchant.address.longitude,
                                            name: order.merchant.businessName,
                                        }
                                        : null
                                }
                                deliveryLocation={{
                                    latitude: order.deliveryInfo.location.lat,
                                    longitude: order.deliveryInfo.location.lng,
                                    address: order.deliveryInfo.address,
                                }}
                            />
                        </div>

                        {/* Location Info */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {order.merchant.address && (
                                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                                    <Package className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-orange-900">Pickup</p>
                                        <p className="text-xs text-orange-700 truncate">
                                            {order.merchant.businessName}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-green-900">Delivery</p>
                                    <p className="text-xs text-green-700 truncate">
                                        {order.deliveryInfo.address}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

            {/* Completed State */}
            {order?.status === OrderStatus.COMPLETED && (
                <Card className="p-8 rounded-2xl bg-green-50 border-2 border-green-200">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-green-900 mb-2">
                            Order Delivered Successfully!
                        </h3>
                        <p className="text-sm text-green-700">
                            Thank you for your order. We hope you enjoy your meal!
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
}

export default memo(OrderTrackingMap, (prevProps, nextProps) => {
    // Only re-render if orderId or initialStatus actually changed
    return prevProps.orderId === nextProps.orderId &&
           prevProps.initialStatus === nextProps.initialStatus;
});
