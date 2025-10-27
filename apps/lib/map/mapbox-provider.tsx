"use client";

import { MapContext } from "@/context/map-context";
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import React, { useEffect, useRef, useState } from "react";
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';


mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
export type Position = number[];
type MapComponentProps = {
    mapContainerRef: React.RefObject<HTMLDivElement | null>;
    initialViewState: {
        longitude: number;
        latitude: number;
        zoom: number;
        initialGeometry?: Position[][];
    };
    drawModes?: DrawModes;
    children?: React.ReactNode;
};


export enum DrawModes {
    DRAW_LINE_STRING = "draw_line_string",
    DRAW_POLYGON = "draw_polygon",
    DRAW_POINT = "draw_point",
    SIMPLE_SELECT = "simple_select",
    DIRECT_SELECT = "direct_select",
    STATIC = "static",
}

export function MapBoxProvider({
    mapContainerRef,
    initialViewState,
    drawModes,
    children,
}: MapComponentProps) {
    const map = useRef<mapboxgl.Map | null>(null);
    const draw = useRef<MapboxDraw | null>(null);
    const [loaded, setLoaded] = useState(false);

    // Memoize initial values to prevent recreation on re-renders
    const initialLongitude = useRef(initialViewState.longitude);
    const initialLatitude = useRef(initialViewState.latitude);
    const initialZoom = useRef(initialViewState.zoom);
    const initialGeometry = useRef(initialViewState.initialGeometry);

    useEffect(() => {
        if (!mapContainerRef.current || map.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/mapbox/standard",
            center: [initialLongitude.current, initialLatitude.current],
            zoom: initialZoom.current,
            attributionControl: true,
        });
        if (drawModes) {
            draw.current = new MapboxDraw({
                displayControlsDefault: false,
                controls: {},

            });
            map.current.addControl(draw.current);

            if (initialGeometry.current) {
                draw.current.add({
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Polygon',
                        coordinates: initialGeometry.current
                    }
                })
            }

            map.current.on('draw.delete', () => {
                console.log('draw.delete');
            });


        }
        map.current.on("load", () => {
            setLoaded(true);
        });


        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [mapContainerRef, drawModes]);

    return (
        <div className="z-[1000]">
            <MapContext.Provider value={{ map: map.current!, draw: draw.current }}>
                {children}
            </MapContext.Provider>
            {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-[1000]">
                    <div className="text-lg font-medium">Loading map...</div>
                </div>
            )}
        </div>
    );
}