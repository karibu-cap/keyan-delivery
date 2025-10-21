"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/hooks/use-inline-translation";
import { toast } from "@/hooks/use-toast";
import type { LongLat } from "@prisma/client";
import { isPointInPolygon } from "@/lib/coordinate-resolver";

interface MapPickerProps {
    zoneName: string;
    zoneColor: string;
    zoneGeometry: { coordinates: number[][][] };
    initialCenter?: LongLat; // [lng, lat]
    onLocationSelect: (coordinates: LongLat) => void;
    selectedCoordinates?: LongLat;
}

export default function MapPicker({
    zoneName,
    zoneColor,
    zoneGeometry,
    initialCenter,
    onLocationSelect,
    selectedCoordinates
}: MapPickerProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const t = useT();
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const polygonRef = useRef<any>(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [showLocationCard, setShowLocationCard] = useState(false);

    // Calculate zone center if no initial center provided
    const getZoneCenter = (): LongLat => {
        if (initialCenter) return initialCenter;

        const coords = zoneGeometry.coordinates[0];
        let sumLng = 0, sumLat = 0;
        coords.forEach(([lng, lat]) => {
            sumLng += lng;
            sumLat += lat;
        });
        return { lng: sumLng / coords.length, lat: sumLat / coords.length };
    };

    const zoneCenter = getZoneCenter();

    // Point in polygon check
    // const isPointInPolygon = (point: LongLat, polygon: number[][][]): boolean => {
    //     const { lng, lat } = point;
    //     const coords = polygon[0];
    //     let inside = false;

    //     for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
    //         const [xi, yi] = coords[i];
    //         const [xj, yj] = coords[j];

    //         const intersect = ((yi > lat) !== (yj > lat)) &&
    //             (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    //         if (intersect) inside = !inside;
    //     }

    //     return inside;
    // };

    // Initialize map
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        // Dynamically load Leaflet
        const loadLeaflet = async () => {
            // Load Leaflet CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);

            // Load Leaflet JS
            const L = await import('leaflet');

            // Fix default marker icon path issue
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });

            // Initialize map
            const map = L.map(mapContainerRef.current!, {
                center: [zoneCenter.lat, zoneCenter.lng],
                zoom: 15,
                zoomControl: false
            });

            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19

            }).addTo(map);

            // Draw zone polygon
            const polygonCoords = zoneGeometry.coordinates[0].map(
                ([lng, lat]) => [lat, lng] as [number, number]
            );

            const polygon = L.polygon(polygonCoords, {
                color: zoneColor,
                fillColor: zoneColor,
                fillOpacity: 0.2,
                weight: 2
            }).addTo(map);

            polygonRef.current = polygon;

            // Fit map to zone bounds with padding
            const bounds = polygon.getBounds();
            map.fitBounds(bounds, { padding: [50, 50] });

            // Add draggable marker
            const marker = L.marker(
                [zoneCenter.lat, zoneCenter.lng],
                { draggable: true }
            ).addTo(map);

            // Handle marker drag
            marker.on('dragend', (e: any) => {
                const position = e.target.getLatLng();
                const coords: LongLat = { lng: position.lng, lat: position.lat };

                // Check if point is inside zone
                if (isPointInPolygon(coords, zoneGeometry)) {
                    onLocationSelect(coords);
                    setShowLocationCard(true);
                } else {
                    // Return marker to previous position
                    if (selectedCoordinates) {
                        marker.setLatLng([selectedCoordinates.lat, selectedCoordinates.lng]);
                    } else {
                        marker.setLatLng([zoneCenter.lat, zoneCenter.lng]);
                    }
                    toast({
                        variant: "destructive",
                        title: t("Location outside delivery zone"),
                        description: t("Please select a location within the shaded area."),
                    });
                }
            });

            // Handle map click
            map.on('click', (e: any) => {
                const coords: LongLat = { lng: e.latlng.lng, lat: e.latlng.lat };

                // Check if point is inside zone
                if (isPointInPolygon(coords, zoneGeometry)) {
                    marker.setLatLng(e.latlng);
                    onLocationSelect(coords);
                    setShowLocationCard(true);
                } else {
                    toast({
                        variant: "destructive",
                        title: t("Location outside delivery zone"),
                        description: t("Please select a location within the shaded area."),
                    });
                }
            });

            mapRef.current = map;
            markerRef.current = marker;

            // If initial coordinates provided, move marker and show card
            if (selectedCoordinates) {
                marker.setLatLng([selectedCoordinates.lat, selectedCoordinates.lng]);
                setShowLocationCard(true);
            }

            // Force map to render properly
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        };

        loadLeaflet();

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Update marker when selectedCoordinates changes (external update)
    useEffect(() => {
        if (markerRef.current && selectedCoordinates) {
            markerRef.current.setLatLng([selectedCoordinates.lat, selectedCoordinates.lng]);
            setShowLocationCard(true);
        }
    }, [selectedCoordinates]);

    // Get user's current location
    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast({
                variant: "destructive",
                title: t("Geolocation not supported"),
                description: t("Your browser doesn't support geolocation."),
            });
            return;
        }

        setIsGettingLocation(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords: LongLat = {
                    lng: position.coords.longitude,
                    lat: position.coords.latitude
                };

                // Check if location is within zone
                if (isPointInPolygon(coords, zoneGeometry)) {
                    // Move marker to current location
                    if (markerRef.current && mapRef.current) {
                        markerRef.current.setLatLng([coords.lat, coords.lng]);
                        mapRef.current.setView([coords.lat, coords.lng], 17);
                        onLocationSelect(coords);
                        setShowLocationCard(true);
                    }
                } else {
                    toast({
                        variant: "destructive",
                        title: t("You're outside the delivery zone"),
                        description: t("Your current location is not within our delivery area. Please select a location within the shaded zone."),
                    });
                }

                setIsGettingLocation(false);
            },
            (error) => {
                console.error("Error getting location:", error);
                toast({
                    variant: "destructive",
                    title: t("Unable to get location"),
                    description: t("Please check your location permissions and try again."),
                });
                setIsGettingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );
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
        <div className="space-y-4">
            {/* Map Instructions */}
            <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-blue-900">
                            {t("Drop a pin at your exact location")}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                            {t("Tap anywhere on the map or drag the red marker to your delivery location. ")}
                            {t("You can only select locations within the shaded delivery zone.")}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Map Container */}
            <div className="relative rounded-xl overflow-hidden border-2 border-border">
                <div
                    ref={mapContainerRef}
                    className="w-full h-[400px] bg-muted"
                />

                {/* Map Controls - Always visible */}
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

                {/* Current Location Button - Always visible */}
                <div className="absolute bottom-4 right-4 z-[1000]">
                    <Button
                        variant="secondary"
                        className="bg-white shadow-lg hover:bg-gray-100"
                        onClick={handleGetCurrentLocation}
                        disabled={isGettingLocation}
                    >
                        <Navigation className="w-4 h-4 mr-2" />
                        {isGettingLocation ? t("Getting location...") : t("Use my location")}
                    </Button>
                </div>

                {/* Zone Badge - Always visible */}
                <div className="absolute top-4 left-4 z-[1000]">
                    <Badge
                        style={{ backgroundColor: zoneColor }}
                        className="text-white shadow-lg"
                    >
                        {zoneName}
                    </Badge>
                </div>
            </div>

            {/* Selected Coordinates Display - Smooth transition */}
            <div
                className={`transition-all duration-300 ease-in-out transform ${showLocationCard && selectedCoordinates
                    ? 'opacity-100 translate-y-0 max-h-40'
                    : 'opacity-0 -translate-y-2 max-h-0 overflow-hidden'
                    }`}
            >
                <Card className="p-4 bg-green-50 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-900">
                                📍 {t("Location selected")}
                            </p>
                            {selectedCoordinates && (
                                <p className="text-xs text-green-700 font-mono mt-1">
                                    {selectedCoordinates.lat.toFixed(6)}, {selectedCoordinates.lng.toFixed(6)}
                                </p>
                            )}
                        </div>
                        <Badge variant="outline" className="text-green-700 border-green-300">
                            {t("High accuracy")}
                        </Badge>
                    </div>
                </Card>
            </div>

            {/* Help Text */}
            <p className="text-xs text-muted-foreground text-center">
                💡 {t("Tip: Zoom in for better precision. The more accurate your pin, the easier delivery will be!")}
            </p>
        </div>
    );
}