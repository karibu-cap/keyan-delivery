"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Navigation, MapPin, Store, Package, DollarSign, Clock, Phone, CheckCircle, Truck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { OrderStatus } from "@prisma/client";
import { useOrderStatus } from "@/hooks/use-order-status";
import { calculateDistanceInKm } from "@/lib/utils/client/distances";
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

interface DriverOrderPageProps {
    order: Order;
    onBack?: () => void;
}

export function DriverOrderPage({ order, onBack }: DriverOrderPageProps) {
    const router = useRouter();
    const [currentLocation, setCurrentLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [pickupCode, setPickupCode] = useState("");
    const [deliveryCode, setDeliveryCode] = useState("");
    const { refreshOrders } = useDriverOrders();
    const { refreshWallet } = useWallet();

    const { loading, acceptOrder, startDelivery, completeDelivery } = useOrderStatus({
        redirectOnComplete: true,
        onOrderUpdate: () => {
            refreshOrders();
            refreshWallet();
        }
    });

    useEffect(() => {
        // Get current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }
    }, []);

    const openInGoogleMaps = () => {
        const destination = `${order.deliveryInfo.delivery_latitude},${order.deliveryInfo.delivery_longitude}`;
        const origin = currentLocation
            ? `${currentLocation.latitude},${currentLocation.longitude}`
            : "";

        // Open Google Maps with directions
        const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
        window.open(url, "_blank");
    };

    

    const merchantDistance = currentLocation
        ? calculateDistanceInKm(
            currentLocation.latitude,
            currentLocation.longitude,
            order.merchant.address.latitude,
            order.merchant.address.longitude
        )
        : "N/A";

    const deliveryDistance = currentLocation
        ? calculateDistanceInKm(
            currentLocation.latitude,
            currentLocation.longitude,
            order.deliveryInfo.delivery_latitude,
            order.deliveryInfo.delivery_longitude
        )
        : "N/A";

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header - Improved responsive */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className="rounded-2xl self-start"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Order Details</h1>
                        <p className="text-sm sm:text-base text-muted-foreground">
                            Order #{order.id.slice(-6)} • {order.merchant.businessName}
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs sm:text-sm">
                        {order.status.replace(/_/g, ' ').toLowerCase()}
                    </Badge>
                </div>

                {/* Main Content Grid - Enhanced responsive */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Left Column - Map and Locations */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Map Section */}
                        <Card className="p-4 sm:p-6 rounded-2xl shadow-card">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                                <h2 className="text-lg sm:text-xl font-semibold">Navigation Map</h2>
                                <Button onClick={openInGoogleMaps} className="rounded-2xl w-full sm:w-auto">
                                    <Navigation className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">Open in </span>Google Maps
                                </Button>
                            </div>

                            {/* Map Placeholder - Responsive height */}
                            <div className="relative w-full h-64 sm:h-80 lg:h-96 bg-accent rounded-2xl overflow-hidden">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    allowFullScreen
                                    src={`https://www.google.com/maps/embed/v1/directions?key=YOUR_API_KEY&origin=${order.merchant.address.latitude},${order.merchant.address.longitude}&destination=${order.deliveryInfo.delivery_latitude},${order.deliveryInfo.delivery_longitude}&mode=driving`}
                                />

                                {/* Fallback UI */}
                                <div className="absolute inset-0 flex items-center justify-center bg-accent">
                                    <div className="text-center px-4">
                                        <MapPin className="w-8 h-8 sm:w-12 sm:h-12 text-primary mx-auto mb-4" />
                                        <p className="text-sm sm:text-base text-muted-foreground mb-4">
                                            Interactive map will show here with Google Maps integration
                                        </p>
                                        <Button onClick={openInGoogleMaps} className="rounded-2xl">
                                            <Navigation className="w-4 h-4 mr-2" />
                                            <span className="hidden sm:inline">Open in </span>Google Maps
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Location Cards - Responsive grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Pickup Location */}
                            <Card className="p-4 rounded-2xl border-2 border-primary/20">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Store className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                                            <h3 className="font-semibold text-sm sm:text-base">Pickup Location</h3>
                                            <Badge variant="outline" className="text-xs w-fit">
                                                {merchantDistance} km from you
                                            </Badge>
                                        </div>
                                        <p className="text-sm font-medium mb-1 truncate">
                                            {order.merchant.businessName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            <span className="block sm:inline">Lat: {order.merchant.address.latitude.toFixed(6)}</span>
                                            <span className="hidden sm:inline"> • </span>
                                            <span className="block sm:inline">Lng: {order.merchant.address.longitude.toFixed(6)}</span>
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Delivery Location */}
                            <Card className="p-4 rounded-2xl border-2 border-success/20">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-success/10 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-success" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                                            <h3 className="font-semibold text-sm sm:text-base">Delivery Location</h3>
                                            <Badge variant="outline" className="text-xs w-fit">
                                                {deliveryDistance} km from you
                                            </Badge>
                                        </div>
                                        <p className="text-sm mb-1 break-words">{order.deliveryInfo.address}</p>
                                        {order.deliveryInfo.deliveryContact && (
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Phone className="w-3 h-3 flex-shrink-0" />
                                                <span className="truncate">{order.deliveryInfo.deliveryContact}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Right Column - Order Details and Management */}
                    <div className="lg:col-span-1">
                        <Card className="p-4 sm:p-6 rounded-2xl shadow-card sticky top-4">
                            <h2 className="text-lg sm:text-xl font-semibold mb-4">Order Information</h2>

                            {/* Order Summary */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">{order.items.length} items</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-success" />
                                    <span className="text-sm font-semibold text-success">
                                        ${order.orderPrices.deliveryFee.toFixed(2)} earnings
                                    </span>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-4 mb-6">
                                <h3 className="font-medium">Items to deliver:</h3>
                                <div className="space-y-3 max-h-40 sm:max-h-48 overflow-y-auto">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{item.product.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Quantity: {item.quantity}
                                                </p>
                                            </div>
                                            <div className="text-right ml-2">
                                                <p className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    ${item.price.toFixed(2)} each
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Total */}
                                <div className="flex justify-between items-center pt-4 border-t">
                                    <span className="font-semibold">Order Total:</span>
                                    <span className="font-bold text-lg">${order.orderPrices.total.toFixed(2)}</span>
                                </div>

                                {/* Your Earnings */}
                                <div className="flex justify-between items-center pt-2 border-t border-success/20 bg-success/5 p-3 rounded-lg">
                                    <span className="font-semibold text-success">Your Earnings:</span>
                                    <span className="font-bold text-lg text-success">
                                        ${order.orderPrices.deliveryFee.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Status Management Section */}
                            <div className="p-4 sm:p-6 bg-gradient-to-r from-primary/5 to-success/5 rounded-lg border-2 border-primary/20">
                                <div className="flex items-center gap-2 mb-4">
                                    <Package className="w-5 h-5 text-primary" />
                                    <h3 className="text-lg font-semibold">Order Management</h3>
                                    <Badge
                                        variant={order.status === OrderStatus.COMPLETED ? "default" : "outline"}
                                        className="ml-auto text-xs"
                                    >
                                        {order.status.replace(/_/g, ' ').toLowerCase()}
                                    </Badge>
                                </div>

                                {/* Status Actions */}
                                <div className="space-y-4">
                                    {/* Accept Order - Only show if status is READY_TO_DELIVER */}
                                    {order.status === OrderStatus.READY_TO_DELIVER && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                <span>Enter the pickup code to accept this order</span>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex-1">
                                                    <Label htmlFor="pickup-code" className="text-sm font-medium">
                                                        Pickup Code
                                                    </Label>
                                                    <Input
                                                        id="pickup-code"
                                                        placeholder="Enter pickup code"
                                                        value={pickupCode}
                                                        onChange={(e) => setPickupCode(e.target.value.toUpperCase())}
                                                        className="mt-1"
                                                        disabled={loading}
                                                    />
                                                </div>
                                                <Button
                                                    onClick={() => acceptOrder(order.id, pickupCode)}
                                                    disabled={loading || !pickupCode.trim()}
                                                    className="w-full"
                                                >
                                                    {loading ? (
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                    ) : (
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                    )}
                                                    Accept Order
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Mark as On The Way - Only show if status is ACCEPTED_BY_DRIVER */}
                                    {order.status === OrderStatus.ACCEPTED_BY_DRIVER && (
                                        <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Truck className="w-4 h-4 text-success flex-shrink-0" />
                                                <span className="text-sm font-medium">Ready to start delivery?</span>
                                            </div>
                                            <Button
                                                onClick={() => startDelivery(order.id)}
                                                disabled={loading}
                                                className="w-full border-success text-success hover:bg-success hover:text-white"
                                            >
                                                {loading ? (
                                                    <div className="w-4 h-4 border-2 border-success border-t-transparent rounded-full animate-spin mr-2" />
                                                ) : (
                                                    <Truck className="w-4 h-4 mr-2" />
                                                )}
                                                Start Delivery
                                            </Button>
                                        </div>
                                    )}

                                    {/* Complete Delivery - Only show if status is ON_THE_WAY */}
                                    {order.status === OrderStatus.ON_THE_WAY && (
                                        <div className="space-y-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                                            <div className="flex items-center gap-2 text-sm text-blue-800">
                                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                                <span className="font-medium">Enter the delivery code to complete this order</span>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex-1">
                                                    <Label htmlFor="delivery-code" className="text-sm font-medium text-blue-900">
                                                        Delivery Code
                                                    </Label>
                                                    <Input
                                                        id="delivery-code"
                                                        placeholder="Enter delivery code"
                                                        value={deliveryCode}
                                                        onChange={(e) => setDeliveryCode(e.target.value.toUpperCase())}
                                                        className="mt-1 border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                                                        disabled={loading}
                                                    />
                                                </div>
                                                <Button
                                                    onClick={() => completeDelivery(order.id, deliveryCode)}
                                                    disabled={loading || !deliveryCode.trim()}
                                                    className="w-full bg-success hover:bg-success/90 text-white font-semibold py-3 text-base shadow-lg"
                                                >
                                                    {loading ? (
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                    ) : (
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                    )}
                                                    Complete Delivery
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Completed Status */}
                                    {order.status === OrderStatus.COMPLETED && (
                                        <div className="flex items-center justify-center p-4 bg-success/10 rounded-lg border-2 border-success/30">
                                            <div className="text-center">
                                                <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                                                <p className="font-semibold text-success">Order Completed Successfully!</p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Thank you for your service
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Additional Notes */}
                            {order.deliveryInfo.additionalNotes && (
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">Delivery Notes:</h4>
                                    <p className="text-sm text-blue-800 break-words">{order.deliveryInfo.additionalNotes}</p>
                                </div>
                            )}

                            {/* Order Timeline */}
                            <div className="mt-6 space-y-3">
                                <h3 className="font-medium">Order Timeline:</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <span className="break-words">Order created: {new Date(order.createdAt).toLocaleString()}</span>
                                    </div>
                                    {order.pickupCode && (
                                        <div className="flex items-center gap-2">
                                            <Package className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                            <span className="break-words">Pickup code: <span className="font-mono font-bold">{order.pickupCode}</span></span>
                                        </div>
                                    )}
                                    {order.deliveryCode && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                            <span className="break-words">Delivery code: <span className="font-mono font-bold">{order.deliveryCode}</span></span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Current Location Info */}
                            {currentLocation && (
                                <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-muted-foreground break-all">
                                        Your current location: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                                    </p>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}