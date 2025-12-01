import { Coordinates } from '@/hooks/use-location-store';
import { calculateTotalDistance } from './distance';

/**
 * Migori town center coordinates from OpenStreetMap
 */
export const MIGORI_CENTER: Coordinates = {
  latitude: -1.0634,
  longitude: 34.4731,
};

/**
 * Migori town boundary polygon (approximate urban area)
 * Based on OpenStreetMap data for Migori town
 * This creates a polygon covering the main urban area
 */
export const MIGORI_BOUNDARY_POLYGON: Coordinates[] = [
  { latitude: -1.0450, longitude: 34.4550 }, // Northwest
  { latitude: -1.0450, longitude: 34.4900 }, // Northeast
  { latitude: -1.0800, longitude: 34.4900 }, // Southeast
  { latitude: -1.0800, longitude: 34.4550 }, // Southwest
];

/**
 * Check if a point is inside a polygon using ray-casting algorithm
 * @param point - The coordinates to check
 * @param polygon - Array of coordinates forming the polygon
 * @returns true if point is inside polygon
 */
function isPointInPolygon(point: Coordinates, polygon: Coordinates[]): boolean {
  let inside = false;
  const { latitude: x, longitude: y } = point;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].latitude;
    const yi = polygon[i].longitude;
    const xj = polygon[j].latitude;
    const yj = polygon[j].longitude;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}


/**
 * Check if coordinates are within Migori service zone
 * @param coordinates - User's current coordinates
 * @returns true if user is in Migori zone
 */
export function isInMigoriZone(coordinates: Coordinates): boolean {
  return isPointInPolygon(coordinates, MIGORI_BOUNDARY_POLYGON);
}

/**
 * Get distance from Migori town center
 * @param coordinates - User's current coordinates
 * @returns Distance in kilometers
 */
export async function getDistanceFromMigori(coordinates: Coordinates): Promise<number> {
  return await calculateTotalDistance(
    {
      end : {
        lat: coordinates.latitude,
        lng: coordinates.longitude,
      },
      start : {
        lat: MIGORI_CENTER.latitude,
        lng: MIGORI_CENTER.longitude,
      }
    }
  );
}
