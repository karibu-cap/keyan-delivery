import { LongLat } from "@prisma/client";


/**
 * Calculate centroid of a polygon
 */
export function calculatePolygonCentroid(
    geometry: { coordinates: number[][][] }
): LongLat {
    const coords = geometry.coordinates[0];
    let sumLng = 0, sumLat = 0;

    coords.forEach(([lng, lat]) => {
        sumLng += lng;
        sumLat += lat;
    });

    return { lng: sumLng / coords.length, lat: sumLat / coords.length };
}

/**
 * Check if a point is inside a polygon (Ray casting algorithm)
 */
export function isPointInPolygon(
    point: LongLat,
    geometry: { coordinates: number[][][] }
): boolean {
    const { lng, lat } = point;
    const polygon = geometry.coordinates[0];

    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];

        const intersect = ((yi > lat) !== (yj > lat))
            && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);

        if (intersect) inside = !inside;
    }

    return inside;
}


/**
 * Geocode an address using Nominatim (OpenStreetMap)
 */
export async function geocodeAddress(
    address: string,
    zoneName?: string
): Promise<LongLat | null> {
    try {
        const fullAddress = zoneName
            ? `${address}, ${zoneName}`
            : `${address}`;

        const query = encodeURIComponent(fullAddress);
        const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

        const response = await fetch(url, {
            headers: { 'User-Agent': 'DeliveryApp/1.0' },
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error('Geocoding API error:', response.status);
            return null;
        }

        const data = await response.json();

        if (data && data[0]) {
            return { lng: parseFloat(data[0].lon), lat: parseFloat(data[0].lat) };
        }
    } catch (error) {
        console.error('Geocoding error:', error);
    }

    return null;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export function calculateDistance(
    coord1: [number, number],
    coord2: [number, number]
): number {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}