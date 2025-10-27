'use client';

import { useEffect, useRef, useState } from "react";

import { LongLat } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { useT } from '@/hooks/use-inline-translation';
import { DrawModes, MapBoxProvider } from "@/lib/map/mapbox-provider";
import { DrawControls, MapBoxControls } from "@/components/map/MapBoxControls";
import { Button } from "@/components/ui/button";
import { useMap } from "@/context/map-context";
import { toast } from "@/hooks/use-toast";
import type { Polygon } from "geojson";


const DEFAULT_CENTER = { lat: -1.2921, lng: 36.8219 };
interface ZoneDrawMapProps {
    initialGeometry?: {
        type: string;
        coordinates: number[][][];
    };
    onGeometryChange: (geometry: { type: string; coordinates: number[][][] }) => void;
    center?: LongLat;
}

export function ZoneDrawMap({ initialGeometry, onGeometryChange, center }: ZoneDrawMapProps) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);

    const handleFinishDrawing = (polygon: Polygon) => {
        onGeometryChange(polygon);
    };


    return (
        <Card className="overflow-hidden shadow-lg">
            <div id="map-container" ref={mapContainerRef} className="w-full h-[500px] bg-gray-100 relative">
                <MapBoxProvider
                    mapContainerRef={mapContainerRef}
                    drawModes={DrawModes.DRAW_POLYGON}
                    initialViewState={{
                        longitude: center?.lng || DEFAULT_CENTER.lng,
                        latitude: center?.lat || DEFAULT_CENTER.lat,
                        initialGeometry: initialGeometry?.coordinates,
                        zoom: 10,
                    }}
                >
                    <DrawControls canAddMultiplePolygone={false} />
                    <MapBoxControls />
                    <SaveChange onSave={handleFinishDrawing} />
                </MapBoxProvider>
            </div>

        </Card>
    );
};


const SaveChange = (props: { onSave: (polygon: Polygon) => void }) => {
    const t = useT();
    const { map, draw } = useMap()
    const [canSave, setCanSave] = useState(false)

    const handleSave = () => {
        const features = draw?.getAll().features ?? [];
        const points = (draw?.getAll().features?.[0]?.geometry as any)?.coordinates?.[0].length ?? 0;
        if (points < 2) {
            toast({
                title: t('Error'),
                description: t('You must draw a polygon'),
                variant: 'destructive',
            })
            return;
        }
        if (features.length > 1) {
            toast({
                title: t('Error'),
                description: t('You can save only one polygone'),
                variant: 'destructive',
            })
            return;
        }
        props.onSave(features[0].geometry as Polygon);
    };



    useEffect(() => {
        if (map) {
            map.on('draw.create', () => {
                setCanSave(true)
            });
            map.on('draw.update', () => {
                setCanSave(true)
            });
        }
    }, [map]);

    if (!canSave) {
        return null;
    }



    return (
        <div className="absolute bottom-8 z-10 flex flex-col gap-2 items-center justify-center w-full">
            <Button className="w-[200px]" type="button" onClick={handleSave}>
                {t('Save')}
            </Button>
        </div>
    );
}