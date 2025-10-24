'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { LongLat } from '@prisma/client';
import { useT } from '@/hooks/use-inline-translation';

interface ZoneDrawMapProps {
    initialGeometry?: {
        type: string;
        coordinates: number[][][];
    };
    onGeometryChange: (geometry: { type: string; coordinates: number[][][] }) => void;
    center?: LongLat;
}

export function ZoneDrawMap({ initialGeometry, onGeometryChange, center }: ZoneDrawMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const polygonRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [points, setPoints] = useState<LongLat[]>([]);
    const { toast } = useToast();
    const t = useT();

    // Default center (Kenya)
    const defaultCenter = center || { lat: -0.0236, lng: 37.9062 };

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const loadLeaflet = async () => {
            // Load Leaflet CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);

            // Load Leaflet JS
            const L = await import('leaflet');

            // Fix default marker icon
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });

            // Initialize map
            const map = L.map(mapContainerRef.current!, {
                center: [defaultCenter.lat, defaultCenter.lng],
                zoom: 13,
                zoomControl: true,
            });

            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map);

            mapRef.current = map;

            // Load initial geometry if provided
            if (initialGeometry && initialGeometry.coordinates[0]) {
                const coords = initialGeometry.coordinates[0];
                const latLngs = coords.map(([lng, lat]) => [lat, lng] as [number, number]);

                const polygon = L.polygon(latLngs, {
                    color: '#3b82f6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.2,
                    weight: 2,
                }).addTo(map);

                polygonRef.current = polygon;
                map.fitBounds(polygon.getBounds());

                // Set initial points
                setPoints(coords.map(([lng, lat]) => ({ lng, lat })));
            }

            // Map click handler for drawing
            map.on('click', (e: any) => {
                if (!isDrawing) return;

                const { lat, lng } = e.latlng;
                const newPoint = { lat, lng };

                // Add marker
                const marker = L.marker([lat, lng], {
                    draggable: true,
                    icon: L.divIcon({
                        className: 'custom-marker',
                        html: `<div style="
              background-color: #3b82f6;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>`,
                    }),
                }).addTo(map);

                markersRef.current.push(marker);

                // Update points
                const updatedPoints = [...points, newPoint];
                setPoints(updatedPoints);

                // Draw/update polygon
                if (updatedPoints.length >= 3) {
                    if (polygonRef.current) {
                        map.removeLayer(polygonRef.current);
                    }

                    const latLngs = updatedPoints.map((p) => [p.lat, p.lng] as [number, number]);
                    const polygon = L.polygon(latLngs, {
                        color: '#3b82f6',
                        fillColor: '#3b82f6',
                        fillOpacity: 0.2,
                        weight: 2,
                    }).addTo(map);

                    polygonRef.current = polygon;

                    // Update geometry callback
                    const geoJsonCoords = [
                        [...updatedPoints.map((p) => [p.lng, p.lat]), [updatedPoints[0].lng, updatedPoints[0].lat]],
                    ];
                    onGeometryChange({
                        type: 'Polygon',
                        coordinates: geoJsonCoords,
                    });
                }

                // Marker drag handler
                marker.on('dragend', () => {
                    const markerIndex = markersRef.current.indexOf(marker);
                    const newLatLng = marker.getLatLng();
                    const newPoints = [...updatedPoints];
                    newPoints[markerIndex] = { lat: newLatLng.lat, lng: newLatLng.lng };
                    setPoints(newPoints);

                    // Update polygon
                    if (polygonRef.current) {
                        const latLngs = newPoints.map((p) => [p.lat, p.lng] as [number, number]);
                        polygonRef.current.setLatLngs(latLngs);

                        // Update geometry
                        const geoJsonCoords = [
                            [...newPoints.map((p) => [p.lng, p.lat]), [newPoints[0].lng, newPoints[0].lat]],
                        ];
                        onGeometryChange({
                            type: 'Polygon',
                            coordinates: geoJsonCoords,
                        });
                    }
                });
            });

            // Force map to render
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

    useEffect(() => {
        if (mapRef.current) {
            const map = mapRef.current;

            // Update click handler when drawing state changes
            if (isDrawing) {
                map.getContainer().style.cursor = 'crosshair';
            } else {
                map.getContainer().style.cursor = '';
            }
        }
    }, [isDrawing]);

    const handleStartDrawing = () => {
        setIsDrawing(true);
        toast({
            title: t('Drawing mode enabled'),
            description: t('Click on the map to add points to your delivery zone'),
        });
    };

    const handleClear = () => {
        // Remove all markers
        markersRef.current.forEach((marker) => {
            if (mapRef.current) {
                mapRef.current.removeLayer(marker);
            }
        });
        markersRef.current = [];

        // Remove polygon
        if (polygonRef.current && mapRef.current) {
            mapRef.current.removeLayer(polygonRef.current);
            polygonRef.current = null;
        }

        setPoints([]);
        setIsDrawing(false);
        onGeometryChange({ type: 'Polygon', coordinates: [[]] });

        toast({
            title: t('Zone cleared'),
            description: t('Start drawing a new zone'),
        });
    };

    const handleFinishDrawing = () => {
        if (points.length < 3) {
            toast({
                variant: 'destructive',
                title: t('Invalid zone'),
                description: t('You need at least 3 points to create a valid delivery zone'),
            });
            return;
        }

        setIsDrawing(false);
        toast({
            title: t('Zone saved'),
            description: t('Your delivery zone boundary has been set'),
        });
    };

    return (
        <Card className="p-0 overflow-hidden">
            {/* Map Controls */}
            <div className="p-4 bg-muted border-b flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium">
                        {t('Points')}: {points.length}
                    </span>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    {!isDrawing && points.length === 0 && (
                        <Button onClick={handleStartDrawing} size="sm" className="bg-primary hover:bg-primary/90">
                            <MapPin className="w-4 h-4 mr-2" />
                            {t('Start Drawing')}
                        </Button>
                    )}

                    {isDrawing && (
                        <Button onClick={handleFinishDrawing} size="sm" variant="default">
                            <Save className="w-4 h-4 mr-2" />
                            {t('Finish Drawing')}
                        </Button>
                    )}

                    {points.length > 0 && (
                        <Button onClick={handleClear} size="sm" variant="destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('Clear')}
                        </Button>
                    )}
                </div>
            </div>

            {/* Map Container */}
            <div ref={mapContainerRef} className="w-full h-[500px] bg-gray-200" />

            {/* Instructions */}
            <div className="p-4 bg-muted text-sm text-muted-foreground">
                <p>
                    <strong>{t('Instructions')}:</strong> {t('Click "Start Drawing" and then click on the map to add points. You need at least 3 points to create a valid zone. Drag markers to adjust the boundary. Click "Finish Drawing" when done.')}
                </p>
            </div>
        </Card>
    );
}