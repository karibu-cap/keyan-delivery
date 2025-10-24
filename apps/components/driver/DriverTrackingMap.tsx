"use client";

import { useEffect, useRef, useState } from "react";
import { Navigation, ZoomIn, ZoomOut, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Badge } from "@/components/ui/badge";
import { preloadMapTiles } from "@/lib/utils/offline";

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

    // Callback when map is ready
    onMapReady?: () => void;
}

export default function DriverTrackingMap({
    driverLocation,
    merchantLocation,
    deliveryLocation,
    onMapReady,
}: DriverTrackingMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const polylinesRef = useRef<any[]>([]);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [isLoadingMap, setIsLoadingMap] = useState(true);
    const isOnline = useOnlineStatus();

    // Initialize map with Leaflet
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const initializeMap = async () => {
            try {
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
                    : merchantLocation
                        ? [merchantLocation.latitude, merchantLocation.longitude]
                        : [deliveryLocation.latitude, deliveryLocation.longitude];

                // Initialize map
                const map = L.map(mapContainerRef.current!, {
                    center: initialCenter,
                    zoom: 14,
                    zoomControl: false,
                });

                // Add tile layer with OpenStreetMap
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19,
                }).addTo(map);

                mapRef.current = map;
                setMapLoaded(true);
                setIsLoadingMap(false);

                // Preload map tiles for offline use
                if (driverLocation || merchantLocation || deliveryLocation) {
                    const centerLat = driverLocation?.latitude || merchantLocation?.latitude || deliveryLocation.latitude;
                    const centerLng = driverLocation?.longitude || merchantLocation?.longitude || deliveryLocation.longitude;

                    // Preload tiles in background (don't await)
                    preloadMapTiles(centerLat, centerLng, 14, 3).catch(err => {
                        console.warn('Failed to preload map tiles:', err);
                    });
                }

                if (onMapReady) {
                    onMapReady();
                }
            } catch (error) {
                console.error("Error initializing map:", error);
                setIsLoadingMap(false);
            }
        };

        initializeMap();

        // Cleanup on unmount
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Update markers and routes when locations change
    useEffect(() => {
        if (!mapLoaded || !mapRef.current) return;

        const updateMapContent = async () => {
            const L = await import("leaflet");
            const map = mapRef.current;

            // Clear existing markers and polylines
            markersRef.current.forEach((marker) => {
                if (marker.remove) marker.remove();
            });
            polylinesRef.current.forEach((polyline) => {
                if (polyline.remove) polyline.remove();
            });
            markersRef.current = [];
            polylinesRef.current = [];

            const bounds: [number, number][] = [];

            // Create custom icon for delivery location (green)
            const deliveryIcon = L.icon({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
                className: 'delivery-marker'
            });

            // Add delivery location marker
            const deliveryMarker = L.marker(
                [deliveryLocation.latitude, deliveryLocation.longitude],
                { icon: deliveryIcon }
            )
                .addTo(map)
                .bindPopup(`<b>🏠 Delivery Location</b><br/>${deliveryLocation.address}`);

            markersRef.current.push(deliveryMarker);
            bounds.push([deliveryLocation.latitude, deliveryLocation.longitude]);

            // Add merchant location marker if coordinates exist
            if (merchantLocation && merchantLocation.latitude !== 0 && merchantLocation.longitude !== 0) {
                const merchantIcon = L.icon({
                    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41],
                    className: 'merchant-marker'
                });

                const merchantMarker = L.marker(
                    [merchantLocation.latitude, merchantLocation.longitude],
                    { icon: merchantIcon }
                )
                    .addTo(map)
                    .bindPopup(`<b>🏪 Pickup Location</b><br/>${merchantLocation.name}`);

                markersRef.current.push(merchantMarker);
                bounds.push([merchantLocation.latitude, merchantLocation.longitude]);
            }

            // Add driver location marker if available
            if (driverLocation) {
                const driverIcon = L.icon({
                    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41],
                    className: 'driver-marker'
                });

                const driverMarker = L.marker(
                    [driverLocation.latitude, driverLocation.longitude],
                    { icon: driverIcon }
                )
                    .addTo(map)
                    .bindPopup("<b>🚗 Your Location</b><br/>Driver");

                markersRef.current.push(driverMarker);
                bounds.push([driverLocation.latitude, driverLocation.longitude]);

                // Draw route lines
                if (merchantLocation && merchantLocation.latitude !== 0 && merchantLocation.longitude !== 0) {
                    // Driver → Merchant (blue dashed line)
                    const driverToMerchantLine = L.polyline(
                        [
                            [driverLocation.latitude, driverLocation.longitude],
                            [merchantLocation.latitude, merchantLocation.longitude],
                        ],
                        {
                            color: "#3b82f6",
                            weight: 4,
                            opacity: 0.7,
                            dashArray: "10, 10",
                        }
                    ).addTo(map);
                    polylinesRef.current.push(driverToMerchantLine);

                    // Merchant → Client (orange dashed line)
                    const merchantToClientLine = L.polyline(
                        [
                            [merchantLocation.latitude, merchantLocation.longitude],
                            [deliveryLocation.latitude, deliveryLocation.longitude],
                        ],
                        {
                            color: "#f97316",
                            weight: 4,
                            opacity: 0.7,
                            dashArray: "10, 10",
                        }
                    ).addTo(map);
                    polylinesRef.current.push(merchantToClientLine);
                } else {
                    // Driver → Client directly (green dashed line)
                    const driverToClientLine = L.polyline(
                        [
                            [driverLocation.latitude, driverLocation.longitude],
                            [deliveryLocation.latitude, deliveryLocation.longitude],
                        ],
                        {
                            color: "#10b981",
                            weight: 4,
                            opacity: 0.7,
                            dashArray: "10, 10",
                        }
                    ).addTo(map);
                    polylinesRef.current.push(driverToClientLine);
                }
            } else if (merchantLocation && merchantLocation.latitude !== 0 && merchantLocation.longitude !== 0) {
                // No driver location yet, just show merchant → client route
                const merchantToClientLine = L.polyline(
                    [
                        [merchantLocation.latitude, merchantLocation.longitude],
                        [deliveryLocation.latitude, deliveryLocation.longitude],
                    ],
                    {
                        color: "#f97316",
                        weight: 4,
                        opacity: 0.7,
                        dashArray: "10, 10",
                    }
                ).addTo(map);
                polylinesRef.current.push(merchantToClientLine);
            }

            // Fit map to show all markers
            if (bounds.length > 0) {
                map.fitBounds(bounds as any, { padding: [50, 50] });
            }
        };

        updateMapContent();
    }, [mapLoaded, driverLocation, merchantLocation, deliveryLocation]);

    const openInGoogleMaps = () => {
        const destination = `${deliveryLocation.latitude},${deliveryLocation.longitude}`;
        const origin = driverLocation
            ? `${driverLocation.latitude},${driverLocation.longitude}`
            : merchantLocation
                ? `${merchantLocation.latitude},${merchantLocation.longitude}`
                : "";

        const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
        window.open(url, "_blank");
    };

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

    return (
        <div className="relative w-full h-full">
            {/* Marker color CSS */}
            <style jsx global>{`
                /* Green marker for delivery location */
                .delivery-marker {
                    filter: hue-rotate(90deg) saturate(1.5);
                }
                
                /* Orange marker for merchant/pickup */
                .merchant-marker {
                    filter: hue-rotate(10deg) saturate(1.8) brightness(1.1);
                }
                
                /* Blue marker for driver */
                .driver-marker {
                    filter: hue-rotate(200deg) saturate(1.5);
                    animation: driver-pulse 2s ease-in-out infinite;
                }
                
                @keyframes driver-pulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.1);
                        opacity: 0.8;
                    }
                }
            `}</style>

            {/* Map container */}
            <div
                ref={mapContainerRef}
                className="w-full h-full rounded-2xl overflow-hidden"
            />

            {/* Loading overlay */}
            {isLoadingMap && (
                <div className="absolute inset-0 flex items-center justify-center bg-accent rounded-2xl">
                    <div className="text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Loading map...</p>
                    </div>
                </div>
            )}

            {/* Offline Indicator */}
            {!isOnline && (
                <div className="absolute top-4 left-4 z-[1000]">
                    <Badge variant="destructive" className="shadow-lg">
                        <WifiOff className="w-3 h-3 mr-1" />
                        Offline Mode
                    </Badge>
                </div>
            )}

            {/* Zoom Controls */}
            {!isLoadingMap && (
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="bg-white shadow-lg hover:bg-gray-100"
                        onClick={handleZoomIn}
                    >
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="secondary"
                        className="bg-white shadow-lg hover:bg-gray-100"
                        onClick={handleZoomOut}
                    >
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Google Maps fallback button */}
            {!isLoadingMap && (
                <div className="absolute bottom-4 right-4 z-[1000]">
                    <Button
                        onClick={openInGoogleMaps}
                        className="bg-white text-primary hover:bg-gray-100 shadow-lg"
                        size="sm"
                    >
                        <Navigation className="w-4 h-4 mr-2" />
                        Google Maps
                    </Button>
                </div>
            )}
        </div>
    );
}
