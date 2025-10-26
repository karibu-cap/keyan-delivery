// apps/components/driver/DriverTrackingMap.tsx
// Composant de carte avec itinéraires réels selon le status de la commande

"use client";

import { useEffect, useRef, useState } from "react";
import { Navigation, ZoomIn, ZoomOut, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Badge } from "@/components/ui/badge";
import { preloadMapTiles } from "@/lib/utils/offline";
import { useRouting } from "@/hooks/use-routing";
import { OrderStatus } from "@prisma/client";
import { createCustomIcon, MAP_ICONS, ROUTE_COLORS, injectMapStyles } from "@/lib/utils/map-icons";

interface DriverTrackingMapProps {
    // Driver's current location
    driverLocation: {
        latitude: number;
        longitude: number;
    } | null;

    // Merchant location (pickup point)
    merchantLocation: {
        latitude: number;
        longitude: number;
        name: string;
    } | null;

    // Client/delivery location
    deliveryLocation: {
        latitude: number;
        longitude: number;
        address: string;
    };

    // Order status to determine what to display
    orderStatus: OrderStatus;

    // Callback when map is ready
    onMapReady?: () => void;
}

export default function DriverTrackingMap({
    driverLocation,
    merchantLocation,
    deliveryLocation,
    orderStatus,
    onMapReady,
}: DriverTrackingMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const routesRef = useRef<any[]>([]);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [isLoadingMap, setIsLoadingMap] = useState(true);
    const isOnline = useOnlineStatus();

    const shouldShowDriverToMerchant =
        (orderStatus === OrderStatus.READY_TO_DELIVER || orderStatus === OrderStatus.ACCEPTED_BY_DRIVER) &&
        driverLocation && merchantLocation && merchantLocation.latitude !== 0;

    const shouldShowMerchantToDelivery =
        (orderStatus === OrderStatus.READY_TO_DELIVER || orderStatus === OrderStatus.ACCEPTED_BY_DRIVER) &&
        merchantLocation && merchantLocation.latitude !== 0;

    const shouldShowDriverToDelivery =
        orderStatus === OrderStatus.ON_THE_WAY && !!driverLocation;

    const shouldShowOnlyDelivery =
        orderStatus === OrderStatus.COMPLETED;

    console.log('orderStatus : ', orderStatus);
    console.log('driverLocation : ', driverLocation);
    console.log('merchantLocation : ', merchantLocation);
    console.log('shouldShowDriverToMerchant : ', shouldShowDriverToMerchant);
    console.log('shouldShowMerchantToDelivery : ', shouldShowMerchantToDelivery);
    console.log('shouldShowDriverToDelivery : ', shouldShowDriverToDelivery);
    console.log('shouldShowOnlyDelivery : ', shouldShowOnlyDelivery);

    const { route: driverToMerchantRoute } = useRouting({
        origin: driverLocation,
        destination: merchantLocation,
        enabled: shouldShowDriverToMerchant,
    });

    const { route: merchantToDeliveryRoute } = useRouting({
        origin: merchantLocation,
        destination: deliveryLocation,
        enabled: shouldShowMerchantToDelivery,
    });

    const { route: driverToDeliveryRoute } = useRouting({
        origin: driverLocation,
        destination: deliveryLocation,
        enabled: shouldShowDriverToDelivery,
    });

    // Initialize map with Leaflet
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const initializeMap = async () => {
            try {
                // Inject custom styles for markers
                injectMapStyles();

                // Load Leaflet CSS
                if (!document.querySelector('link[href*="leaflet"]')) {
                    const link = document.createElement("link");
                    link.rel = "stylesheet";
                    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
                    document.head.appendChild(link);
                }

                // Dynamically import Leaflet
                const L = await import("leaflet");

                // Fix default marker icon path issue
                delete (L.Icon.Default.prototype as any)._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                });

                // Wait for CSS to load
                await new Promise(resolve => setTimeout(resolve, 100));

                // Determine initial center
                const initialCenter: [number, number] = driverLocation
                    ? [driverLocation.latitude, driverLocation.longitude]
                    : merchantLocation && merchantLocation.latitude !== 0
                        ? [merchantLocation.latitude, merchantLocation.longitude]
                        : [deliveryLocation.latitude, deliveryLocation.longitude];

                // Initialize map
                const map = L.map(mapContainerRef.current!, {
                    center: initialCenter,
                    zoom: 13,
                    zoomControl: false,
                });

                // Add tile layer
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19,
                }).addTo(map);

                // Preload tiles for offline support
                if (isOnline) {
                    preloadMapTiles(initialCenter[0], initialCenter[1]);
                }

                mapRef.current = map;
                setMapLoaded(true);
                setIsLoadingMap(false);

                if (onMapReady) {
                    onMapReady();
                }
            } catch (error) {
                console.error("Error initializing map:", error);
                setIsLoadingMap(false);
            }
        };

        initializeMap();

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Update markers and routes when data changes
    useEffect(() => {
        if (!mapLoaded || !mapRef.current) return;

        const updateMapContent = async () => {
            const L = await import("leaflet");
            const map = mapRef.current;

            // Clear existing markers and routes
            markersRef.current.forEach((marker) => {
                if (marker.remove) marker.remove();
            });
            routesRef.current.forEach((route) => {
                if (route.remove) route.remove();
            });
            markersRef.current = [];
            routesRef.current = [];

            const bounds: [number, number][] = [];

            // ====================
            // COMPLETED: Afficher seulement le point de livraison
            // ====================
            if (shouldShowOnlyDelivery) {
                const deliveryIcon = L.divIcon({
                    className: "custom-marker",
                    html: createCustomIcon(
                        MAP_ICONS.delivery.emoji,
                        MAP_ICONS.delivery.color,
                        MAP_ICONS.delivery.label
                    ),
                    iconSize: [40, 40],
                    iconAnchor: [20, 40],
                    popupAnchor: [0, -40],
                });

                const deliveryMarker = L.marker(
                    [deliveryLocation.latitude, deliveryLocation.longitude],
                    { icon: deliveryIcon }
                )
                    .addTo(map)
                    .bindPopup(
                        `<div style="font-weight: 600; color: ${MAP_ICONS.delivery.color}">
                            ${MAP_ICONS.delivery.emoji} Delivery Completed
                        </div>
                        <div style="margin-top: 4px; font-size: 13px;">
                            ${deliveryLocation.address}
                        </div>`,
                        { className: 'custom-marker-popup' }
                    );

                markersRef.current.push(deliveryMarker);
                bounds.push([deliveryLocation.latitude, deliveryLocation.longitude]);

                // Fit map to delivery location
                if (bounds.length > 0) {
                    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
                }

                return;
            }

            // ====================
            // READY_TO_DELIVER & ACCEPTED_BY_DRIVER: 
            // Afficher Driver, Merchant, Delivery + itinéraires complets
            // ====================
            if (orderStatus === OrderStatus.READY_TO_DELIVER || orderStatus === OrderStatus.ACCEPTED_BY_DRIVER) {
                // 1. Marker Driver
                if (driverLocation) {
                    const driverIcon = L.divIcon({
                        className: "custom-marker",
                        html: createCustomIcon(
                            MAP_ICONS.driver.emoji,
                            MAP_ICONS.driver.color,
                            MAP_ICONS.driver.label
                        ),
                        iconSize: [40, 40],
                        iconAnchor: [20, 40],
                        popupAnchor: [0, -40],
                    });

                    const driverMarker = L.marker(
                        [driverLocation.latitude, driverLocation.longitude],
                        { icon: driverIcon }
                    )
                        .addTo(map)
                        .bindPopup(
                            `<div style="font-weight: 600; color: ${MAP_ICONS.driver.color}">
                                ${MAP_ICONS.driver.emoji} Your Location
                            </div>
                            <div style="margin-top: 4px; font-size: 13px;">
                                Driver Position
                            </div>`,
                            { className: 'custom-marker-popup' }
                        );

                    markersRef.current.push(driverMarker);
                    bounds.push([driverLocation.latitude, driverLocation.longitude]);
                }

                // 2. Marker Merchant
                if (merchantLocation && merchantLocation.latitude !== 0) {
                    const merchantIcon = L.divIcon({
                        className: "custom-marker",
                        html: createCustomIcon(
                            MAP_ICONS.merchant.emoji,
                            MAP_ICONS.merchant.color,
                            MAP_ICONS.merchant.label
                        ),
                        iconSize: [40, 40],
                        iconAnchor: [20, 40],
                        popupAnchor: [0, -40],
                    });

                    const merchantMarker = L.marker(
                        [merchantLocation.latitude, merchantLocation.longitude],
                        { icon: merchantIcon }
                    )
                        .addTo(map)
                        .bindPopup(
                            `<div style="font-weight: 600; color: ${MAP_ICONS.merchant.color}">
                                ${MAP_ICONS.merchant.emoji} Pickup Location
                            </div>
                            <div style="margin-top: 4px; font-size: 13px;">
                                ${merchantLocation.name}
                            </div>`,
                            { className: 'custom-marker-popup' }
                        );

                    markersRef.current.push(merchantMarker);
                    bounds.push([merchantLocation.latitude, merchantLocation.longitude]);
                }

                // 3. Marker Delivery
                const deliveryIcon = L.divIcon({
                    className: "custom-marker",
                    html: createCustomIcon(
                        MAP_ICONS.delivery.emoji,
                        MAP_ICONS.delivery.color,
                        MAP_ICONS.delivery.label
                    ),
                    iconSize: [40, 40],
                    iconAnchor: [20, 40],
                    popupAnchor: [0, -40],
                });

                const deliveryMarker = L.marker(
                    [deliveryLocation.latitude, deliveryLocation.longitude],
                    { icon: deliveryIcon }
                )
                    .addTo(map)
                    .bindPopup(
                        `<div style="font-weight: 600; color: ${MAP_ICONS.delivery.color}">
                            ${MAP_ICONS.delivery.emoji} Delivery Location
                        </div>
                        <div style="margin-top: 4px; font-size: 13px;">
                            ${deliveryLocation.address}
                        </div>`,
                        { className: 'custom-marker-popup' }
                    );

                markersRef.current.push(deliveryMarker);
                bounds.push([deliveryLocation.latitude, deliveryLocation.longitude]);

                // 4. Tracer itinéraire Driver → Merchant
                if (driverToMerchantRoute && driverToMerchantRoute.coordinates.length > 0) {
                    const driverToMerchantLine = L.polyline(
                        driverToMerchantRoute.coordinates,
                        {
                            color: ROUTE_COLORS.driverToMerchant,
                            weight: 5,
                            opacity: 0.8,
                            dashArray: "10, 10",
                        }
                    ).addTo(map);
                    routesRef.current.push(driverToMerchantLine);
                }

                // 5. Tracer itinéraire Merchant → Delivery
                if (merchantToDeliveryRoute && merchantToDeliveryRoute.coordinates.length > 0) {
                    const merchantToDeliveryLine = L.polyline(
                        merchantToDeliveryRoute.coordinates,
                        {
                            color: ROUTE_COLORS.merchantToDelivery,
                            weight: 5,
                            opacity: 0.8,
                            dashArray: "10, 10",
                        }
                    ).addTo(map);
                    routesRef.current.push(merchantToDeliveryLine);
                }
            }

            // ====================
            // ON_THE_WAY: 
            // Afficher Driver, Delivery + itinéraire Driver → Delivery
            // ====================
            if (orderStatus === OrderStatus.ON_THE_WAY) {
                // 1. Marker Driver
                if (driverLocation) {
                    const driverIcon = L.divIcon({
                        className: "custom-marker",
                        html: createCustomIcon(
                            MAP_ICONS.driver.emoji,
                            MAP_ICONS.driver.color,
                            MAP_ICONS.driver.label
                        ),
                        iconSize: [40, 40],
                        iconAnchor: [20, 40],
                        popupAnchor: [0, -40],
                    });

                    const driverMarker = L.marker(
                        [driverLocation.latitude, driverLocation.longitude],
                        { icon: driverIcon }
                    )
                        .addTo(map)
                        .bindPopup(
                            `<div style="font-weight: 600; color: ${MAP_ICONS.driver.color}">
                                ${MAP_ICONS.driver.emoji} Driver En Route
                            </div>
                            <div style="margin-top: 4px; font-size: 13px;">
                                On the way to you
                            </div>`,
                            { className: 'custom-marker-popup' }
                        );

                    markersRef.current.push(driverMarker);
                    bounds.push([driverLocation.latitude, driverLocation.longitude]);
                }

                // 2. Marker Delivery
                const deliveryIcon = L.divIcon({
                    className: "custom-marker",
                    html: createCustomIcon(
                        MAP_ICONS.delivery.emoji,
                        MAP_ICONS.delivery.color,
                        MAP_ICONS.delivery.label
                    ),
                    iconSize: [40, 40],
                    iconAnchor: [20, 40],
                    popupAnchor: [0, -40],
                });

                const deliveryMarker = L.marker(
                    [deliveryLocation.latitude, deliveryLocation.longitude],
                    { icon: deliveryIcon }
                )
                    .addTo(map)
                    .bindPopup(
                        `<div style="font-weight: 600; color: ${MAP_ICONS.delivery.color}">
                            ${MAP_ICONS.delivery.emoji} Delivery Destination
                        </div>
                        <div style="margin-top: 4px; font-size: 13px;">
                            ${deliveryLocation.address}
                        </div>`,
                        { className: 'custom-marker-popup' }
                    );

                markersRef.current.push(deliveryMarker);
                bounds.push([deliveryLocation.latitude, deliveryLocation.longitude]);

                // 3. Tracer itinéraire Driver → Delivery
                if (driverToDeliveryRoute && driverToDeliveryRoute.coordinates.length > 0) {
                    const driverToDeliveryLine = L.polyline(
                        driverToDeliveryRoute.coordinates,
                        {
                            color: ROUTE_COLORS.driverToDelivery,
                            weight: 5,
                            opacity: 0.8,
                        }
                    ).addTo(map);
                    routesRef.current.push(driverToDeliveryLine);
                }
            }

            // Fit map to show all markers
            if (bounds.length > 0) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        };

        updateMapContent();
    }, [
        mapLoaded,
        driverLocation,
        merchantLocation,
        deliveryLocation,
        orderStatus,
        driverToMerchantRoute,
        merchantToDeliveryRoute,
        driverToDeliveryRoute,
        shouldShowOnlyDelivery,
    ]);

    // Zoom controls
    const handleZoomIn = () => {
        if (mapRef.current) {
            mapRef.current.zoomIn();
        }
    };

    const handleZoomOut = () => {
        if (mapRef.current) {
            mapRef.current.zoomOut();
        }
    };

    const handleRecenter = () => {
        if (mapRef.current && driverLocation) {
            mapRef.current.setView(
                [driverLocation.latitude, driverLocation.longitude],
                15,
                { animate: true }
            );
        }
    };

    return (
        <div className="relative w-full h-full">
            {/* Map Container */}
            <div
                ref={mapContainerRef}
                className="w-full h-full rounded-2xl overflow-hidden bg-muted"
            />

            {/* Loading Overlay */}
            {isLoadingMap && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-2xl">
                    <div className="text-center space-y-3">
                        <div className="animate-spin w-10 h-10 border-3 border-primary border-t-transparent rounded-full mx-auto" />
                        <p className="text-sm text-muted-foreground">Loading map...</p>
                    </div>
                </div>
            )}

            {/* Offline Badge */}
            {!isOnline && (
                <Badge
                    variant="destructive"
                    className="absolute top-4 left-4 z-[1000] gap-2"
                >
                    <WifiOff className="w-3 h-3" />
                    Offline Mode
                </Badge>
            )}

            {/* Zoom Controls */}
            {mapLoaded && (
                <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full shadow-lg"
                        onClick={handleZoomIn}
                    >
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full shadow-lg"
                        onClick={handleZoomOut}
                    >
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                    {driverLocation && (
                        <Button
                            size="icon"
                            variant="secondary"
                            className="rounded-full shadow-lg"
                            onClick={handleRecenter}
                        >
                            <Navigation className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}