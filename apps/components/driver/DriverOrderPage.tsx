// File: /components/driver/DriverOrderPageRefactored.tsx
// Refactored DriverOrderPage with: Menu items + images, Client info with contact actions,
// Stats cards (distance to merchant, distance to client, earnings), Merchant info with contact actions

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, MapPin, Store, Package, WalletIcon, Phone, MessageSquare,
    CheckCircle, Truck, AlertCircle, User, Navigation
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderStatus } from "@prisma/client";
import { useOrderStatus } from "@/hooks/use-order-status";
import { calculateRouteDistance } from "@/lib/utils/routing";
import { reverseGeocode } from "@/lib/utils/client/geo_coding";
import { useDriverOrders } from "@/hooks/use-driver-orders";
import { useWallet } from "@/hooks/use-wallet";
import { useT } from "@/hooks/use-inline-translation";
import { useOrderTracking } from "@/hooks/use-order-tracking";
import { useToast } from "@/hooks/use-toast";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Order } from "@/lib/models/order";
import LocationPermissionCard from "./LocationPermissionCard";
import AnimatedStatsCard from "./AnimatedStatsCard";

// Dynamically import the tracking map
const DriverTrackingMap = dynamic(
    () => import("@/components/driver/DriverTrackingMap"),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-64 sm:h-80 lg:h-96 rounded-2xl bg-accent animate-pulse flex items-center justify-center">
                <div className="text-center space-y-2">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="text-sm text-muted-foreground">Loading map...</p>
                </div>
            </div>
        ),
    }
);


interface DriverOrderPageProps {
    order: Order;
    onBack?: () => void;
}

export function DriverOrderPage({
    order,
    onBack,
}: DriverOrderPageProps) {
    const router = useRouter();
    const t = useT();
    const { toast } = useToast();
    const [pickupCode, setPickupCode] = useState("");
    const [deliveryCode, setDeliveryCode] = useState("");
    const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [merchantStreet, setMerchantStreet] = useState<string | null>(null);
    const [deliveryStreet, setDeliveryStreet] = useState<string | null>(null);
    const [merchantDistance, setMerchantDistance] = useState<string | number | null>(null);
    const [deliveryDistance, setDeliveryDistance] = useState<string | number | null>(null);
    const [hasLocationPermission, setHasLocationPermission] = useState(false);
    const [isCheckingPermission, setIsCheckingPermission] = useState(true);

    const { refreshOrders } = useDriverOrders();
    const { refreshWallet } = useWallet();

    const { loading, acceptOrder, startDelivery, completeDelivery } = useOrderStatus({
        redirectOnComplete: false,
        onOrderUpdate: () => {
            setPickupCode("");
            setDeliveryCode("");
            refreshOrders();
            refreshWallet();
        }
    });

    const { updateDriverLocation } = useOrderTracking({ orderId: order.id });

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

    // Handle permission granted
    const handlePermissionGranted = (position: GeolocationPosition) => {
        console.log('Location permission granted:', position);
        setHasLocationPermission(true);
        setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        });
    };

    // Handle permission denied
    const handlePermissionDenied = () => {
        console.log('Location permission denied');
        setHasLocationPermission(false);
    };

    // Get current location and update server
    useEffect(() => {
        if (!navigator.geolocation || !hasLocationPermission) return;

        let watchId: number | null = null;

        // Only track location for active orders
        if (order.status === OrderStatus.ACCEPTED_BY_DRIVER || order.status === OrderStatus.ON_THE_WAY) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const newLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    };
                    setCurrentLocation(newLocation);

                    // Update server with new location
                    updateDriverLocation(newLocation.latitude, newLocation.longitude).catch((error) => {
                        console.error("Failed to update driver location:", error);
                    });
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    toast({
                        title: "Location Error",
                        description: "Unable to get your current location",
                        variant: "destructive",
                    });
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 5000,
                }
            );
        }

        return () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [order.status, order.id, updateDriverLocation, toast]);

    // Fetch merchant address using reverse geocoding
    useEffect(() => {
        if (order.merchant.address.latitude && order.merchant.address.longitude &&
            order.merchant.address.latitude !== 0 && order.merchant.address.longitude !== 0) {
            reverseGeocode(order.merchant.address.latitude, order.merchant.address.longitude)
                .then((result) => {
                    setMerchantStreet(result.formattedAddress);
                })
                .catch((error) => {
                    console.error("Failed to reverse geocode merchant address:", error);
                });
        }
    }, [order.merchant.address.latitude, order.merchant.address.longitude]);

    // Fetch delivery address using reverse geocoding
    useEffect(() => {
        if (order.deliveryInfo.delivery_longitude && order.deliveryInfo.delivery_latitude &&
            order.deliveryInfo.delivery_latitude !== 0 && order.deliveryInfo.delivery_longitude !== 0) {
            reverseGeocode(order.deliveryInfo.delivery_latitude, order.deliveryInfo.delivery_longitude)
                .then((result) => {
                    setDeliveryStreet(result.formattedAddress);
                })
                .catch((error) => {
                    console.error("Failed to reverse geocode delivvery address:", error);
                });
        }
    }, [order.merchant.address.latitude, order.merchant.address.longitude]);

    // Calculate distances using OSRM routing with fallback
    useEffect(() => {
        const calculateDistances = async () => {
            if (!currentLocation) {
                setMerchantDistance("N/A");
                setDeliveryDistance("N/A");
                return;
            }

            try {
                // Calculate distance to merchant
                const merchantRoute = await calculateRouteDistance(
                    currentLocation.latitude,
                    currentLocation.longitude,
                    order.merchant.address.latitude,
                    order.merchant.address.longitude
                );
                setMerchantDistance(merchantRoute.distance.toFixed(2));

                // Calculate distance to client
                const deliveryRoute = await calculateRouteDistance(
                    currentLocation.latitude,
                    currentLocation.longitude,
                    order.deliveryInfo.delivery_latitude,
                    order.deliveryInfo.delivery_longitude
                );
                setDeliveryDistance(deliveryRoute.distance.toFixed(2));
            } catch (error) {
                console.error("Failed to calculate distances:", error);
                setMerchantDistance("N/A");
                setDeliveryDistance("N/A");
            }
        };

        calculateDistances();
    }, [currentLocation, order.merchant.address.latitude, order.merchant.address.longitude, order.deliveryInfo.delivery_latitude, order.deliveryInfo.delivery_longitude]);


    // Contact actions
    const openPhone = (phone: string) => {
        window.location.href = `tel:${phone}`;
    };

    const openSMS = (phone: string) => {
        window.location.href = `sms:${phone}`;
    };

    const openWhatsApp = (phone: string) => {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/${cleanPhone}`, '_blank');
    };

    const openInGoogleMaps = () => {
        const destination = `${order.deliveryInfo.delivery_latitude},${order.deliveryInfo.delivery_longitude}`;
        const origin = currentLocation
            ? `${currentLocation.latitude},${currentLocation.longitude}`
            : "";
        const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
        window.open(url, "_blank");
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section with Red Gradient */}
            <section className="gradient-hero py-8 sm:py-12 lg:py-16 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-white">
                        {/* Back Button */}
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            className="rounded-2xl mb-4 hover:bg-white/20 text-white inline-flex items-center gap-2 px-4"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back to dashboard</span>
                        </Button>

                        {/* Header with animated icon */}
                        <div className="flex items-start gap-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full animate-pulse flex-shrink-0">
                                <Package className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                                    Order Details
                                </h1>
                                <p className="text-sm sm:text-base text-white/90">
                                    Order #{order.id.slice(-6).toUpperCase()} • {order.merchant.businessName}
                                </p>
                                <Badge className="mt-2 bg-white/20 text-white border-white/30">
                                    {order.status.replace(/_/g, ' ').toLowerCase()}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Cards - 3 cards overlapping hero */}
            <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Distance to Merchant */}
                    <AnimatedStatsCard
                        title="Distance to Merchant"
                        value={typeof merchantDistance === 'number' ? `${merchantDistance.toFixed(1)} km` : merchantDistance || 'N/A'}
                        icon={Store}
                        color="text-blue-600"
                        bgColor="bg-blue-50 dark:bg-blue-950/20"
                        borderColor="border-blue-200 dark:border-blue-800"
                        animationDelay={0}
                    />

                    {/* Distance to Client */}
                    <AnimatedStatsCard
                        title="Distance to Client"
                        value={typeof deliveryDistance === 'number' ? `${deliveryDistance.toFixed(1)} km` : deliveryDistance || 'N/A'}
                        icon={MapPin}
                        color="text-purple-600"
                        bgColor="bg-purple-50 dark:bg-purple-950/20"
                        borderColor="border-purple-200 dark:border-purple-800"
                        animationDelay={100}
                    />

                    {/* Earnings */}
                    <AnimatedStatsCard
                        title="Your Earnings"
                        value={t.formatAmount(order.orderPrices.deliveryFee)}
                        icon={WalletIcon}
                        color="text-red-600"
                        bgColor="bg-red-50 dark:bg-red-950/20"
                        borderColor="border-red-200 dark:border-red-800"
                        animationDelay={200}
                    />
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-7xl space-y-6">
                {/* Show GPS permission card if permission not granted */}
                {isCheckingPermission ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                ) : !hasLocationPermission ? (
                    <LocationPermissionCard
                        onPermissionGranted={handlePermissionGranted}
                        onPermissionDenied={handlePermissionDenied}
                    />
                ) : (
                    <>
                        {/* Main Grid - 2 columns */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Map, Merchant, Client, Items */}
                            <div className="lg:col-span-2 space-y-6">
                        {/* Map Section */}
                        <Card className="p-6 rounded-2xl shadow-card">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-semibold">{t("Navigation Map")}</h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {t("Track your route in real time")}
                                    </p>
                                </div>
                                <Button
                                    onClick={openInGoogleMaps}
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Navigation className="w-4 h-4" />
                                    <span className="hidden sm:inline">{t("Google Maps")}</span>
                                </Button>
                            </div>

                            <div className="relative z-0 w-full h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden">
                                <DriverTrackingMap
                                    driverLocation={currentLocation}
                                    merchantLocation={
                                        order.merchant.address.latitude !== 0 && order.merchant.address.longitude !== 0
                                            ? {
                                                latitude: order.merchant.address.latitude,
                                                longitude: order.merchant.address.longitude,
                                                name: order.merchant.businessName,
                                            }
                                            : null
                                    }
                                    deliveryLocation={{
                                        latitude: order.deliveryInfo.delivery_latitude,
                                        longitude: order.deliveryInfo.delivery_longitude,
                                        address: order.deliveryInfo.address,
                                    }}
                                />
                            </div>
                        </Card>

                        {/* Merchant Info Card */}
                        <Card className="p-6 rounded-2xl shadow-card border-2 border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2 mb-4">
                                <Store className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-semibold">{t("Merchant Information")}</h3>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start gap-4">
                                {/* Merchant Image */}
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-950 flex-shrink-0">
                                    {order.merchant.bannerUrl ? (
                                        <Image
                                            src={order.merchant.bannerUrl}
                                            alt={order.merchant.businessName}
                                            width={64}
                                            height={64}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Store className="w-8 h-8 text-blue-600" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 w-full">
                                    <h4 className="font-semibold text-lg">{order.merchant.businessName}</h4>
                                    {order.merchant.address.latitude && order.merchant.address.longitude && (
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                            {merchantStreet}
                                        </p>
                                    )}
                                    {order.merchant.phone && (
                                        <div className="mt-2">
                                            <p className="text-sm text-muted-foreground">{t("Phone Number")}</p>
                                            <p className="font-medium text-sm">{order.merchant.phone}</p>
                                        </div>
                                    )}
                                    {order.merchant.phone && (
                                        <div className="flex flex-wrap items-center gap-2 mt-3">
                                            <Button
                                                onClick={() => openPhone(order.merchant.phone!)}
                                                size="sm"
                                                variant="outline"
                                                className="gap-1 flex-1 sm:flex-none min-w-[80px]"
                                            >
                                                <Phone className="w-4 h-4" />
                                                <span className="text-xs sm:text-sm">{t("Call")}</span>
                                            </Button>
                                            <Button
                                                onClick={() => openSMS(order.merchant.phone!)}
                                                size="sm"
                                                variant="outline"
                                                className="gap-1 flex-1 sm:flex-none min-w-[80px]"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                <span className="text-xs sm:text-sm">{t("SMS")}</span>
                                            </Button>
                                            <Button
                                                onClick={() => openWhatsApp(order.merchant.phone!)}
                                                size="sm"
                                                variant="outline"
                                                className="gap-1 bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900 flex-1 sm:flex-none min-w-[100px]"
                                            >
                                                <WhatsAppIcon className="w-4 h-4 text-green-600" />
                                                <span className="text-xs sm:text-sm">{t("WhatsApp")}</span>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Client Info Card */}
                        <Card className="p-6 rounded-2xl shadow-card border-2 border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-2 mb-4">
                                <User className="w-5 h-5 text-purple-600" />
                                <h3 className="text-lg font-semibold">{t("Client Information")}</h3>
                            </div>

                            <div className="space-y-3">
                                {order.deliveryInfo.deliveryContactName && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t("Name")}</p>
                                        <p className="font-semibold text-sm sm:text-base">{order.deliveryInfo.deliveryContactName}</p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm text-muted-foreground">{t("Delivery Address")}</p>
                                    <p className="font-medium text-sm sm:text-base line-clamp-3">{deliveryStreet || order.deliveryInfo.address}</p>
                                </div>

                                {order.deliveryInfo.deliveryContact && (
                                    <>
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t("Phone Number")}</p>
                                            <p className="font-medium text-sm">{order.deliveryInfo.deliveryContact}</p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 pt-2">
                                            <Button
                                                onClick={() => openPhone(order.deliveryInfo.deliveryContact!)}
                                                size="sm"
                                                variant="outline"
                                                className="gap-1 flex-1 sm:flex-none min-w-[80px]"
                                            >
                                                <Phone className="w-4 h-4" />
                                                <span className="text-xs sm:text-sm">Call</span>
                                            </Button>
                                            <Button
                                                onClick={() => openSMS(order.deliveryInfo.deliveryContact!)}
                                                size="sm"
                                                variant="outline"
                                                className="gap-1 flex-1 sm:flex-none min-w-[80px]"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                <span className="text-xs sm:text-sm">SMS</span>
                                            </Button>
                                            <Button
                                                onClick={() => openWhatsApp(order.deliveryInfo.deliveryContact!)}
                                                size="sm"
                                                variant="outline"
                                                className="gap-1 bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900 flex-1 sm:flex-none min-w-[100px]"
                                            >
                                                <WhatsAppIcon className="w-4 h-4 text-green-600" />
                                                <span className="text-xs sm:text-sm">WhatsApp</span>
                                            </Button>
                                        </div>
                                    </>
                                )}

                                {order.deliveryInfo.additionalNotes && (
                                    <div className="pt-3 border-t">
                                        <p className="text-sm text-muted-foreground">Additional Notes</p>
                                        <p className="text-sm mt-1 line-clamp-3">{order.deliveryInfo.additionalNotes}</p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Menu Items Card */}
                        <Card className="p-6 rounded-2xl shadow-card">
                            <div className="flex items-center gap-2 mb-4">
                                <Package className="w-5 h-5 text-red-600" />
                                <h3 className="text-lg font-semibold">Order Items ({order.items.length})</h3>
                            </div>

                            <div className="space-y-3">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-start gap-4 p-4 bg-accent/50 rounded-xl hover:bg-accent transition-colors">
                                        {/* Product Image */}
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
                                            {item.product.images ? (
                                                <Image
                                                    src={item.product.images[0]}
                                                    alt={item.product.title}
                                                    width={64}
                                                    height={64}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-gray-400" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-sm truncate">{item.product.title}</h4>
                                            {item.product.description && (
                                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                                    {item.product.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 mt-2">
                                                <p className="text-xs text-muted-foreground">
                                                    Qty: <span className="font-semibold text-foreground">{item.quantity}</span>
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Price: <span className="font-semibold text-foreground">{t.formatAmount(item.price)}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Total Price */}
                                        <div className="text-right">
                                            <p className="font-bold text-sm">{t.formatAmount(item.price * item.quantity)}</p>
                                        </div>
                                    </div>
                                ))}

                                {/* Order Total */}
                                <div className="flex justify-between items-center pt-4 border-t">
                                    <span className="font-semibold">Order Total:</span>
                                    <span className="font-bold text-lg">{t.formatAmount(order.orderPrices.total)}</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column - Actions */}
                    <div className="lg:col-span-1">
                        <Card className="p-6 rounded-2xl shadow-card sticky top-4">
                            <h2 className="text-xl font-semibold mb-4">Order Management</h2>

                            {/* Status Badge */}
                            <div className="mb-6">
                                <Badge className="w-full justify-center py-2 text-sm">
                                    {order.status.replace(/_/g, ' ').toLowerCase()}
                                </Badge>
                            </div>

                            {/* Actions based on status */}
                            <div className="space-y-4">
                                {/* Accept Order */}
                                {order.status === OrderStatus.READY_TO_DELIVER && (
                                    <div className="space-y-3">
                                        <Label htmlFor="pickup-code">Pickup Code</Label>
                                        <Input
                                            id="pickup-code"
                                            placeholder="Enter code from merchant"
                                            value={pickupCode}
                                            onChange={(e) => setPickupCode(e.target.value.toUpperCase())}
                                            className="uppercase"
                                        />
                                        <Button
                                            onClick={() => acceptOrder(order.id, pickupCode)}
                                            disabled={loading || !pickupCode.trim()}
                                            className="w-full"
                                        >
                                            {loading ? "Processing..." : "Accept Order"}
                                        </Button>
                                    </div>
                                )}

                                {/* Start Delivery */}
                                {order.status === OrderStatus.ACCEPTED_BY_DRIVER && (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                            <p className="text-sm text-center">
                                                Pickup Code: <span className="font-mono font-bold text-lg">{order.pickupCode}</span>
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => startDelivery(order.id)}
                                            disabled={loading}
                                            className="w-full"
                                        >
                                            <Truck className="w-4 h-4 mr-2" />
                                            {loading ? "Starting..." : "Start Delivery"}
                                        </Button>
                                    </div>
                                )}

                                {/* Complete Delivery */}
                                {order.status === OrderStatus.ON_THE_WAY && (
                                    <div className="space-y-3">
                                        <Label htmlFor="delivery-code">Delivery Code</Label>
                                        <Input
                                            id="delivery-code"
                                            placeholder="Enter code from client"
                                            value={deliveryCode}
                                            onChange={(e) => setDeliveryCode(e.target.value.toUpperCase())}
                                            className="uppercase"
                                        />
                                        <Button
                                            onClick={() => completeDelivery(order.id, deliveryCode)}
                                            disabled={loading || !deliveryCode.trim()}
                                            className="w-full bg-green-600 hover:bg-green-700"
                                        >
                                            {loading ? "Processing..." : "Complete Delivery"}
                                        </Button>
                                    </div>
                                )}

                                {/* Completed */}
                                {order.status === OrderStatus.COMPLETED && (
                                    <div className="text-center py-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                                        <p className="font-semibold text-green-600">Order Completed!</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Great job on this delivery
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
                    </>
                )}
            </div>
        </div>
    );
}
