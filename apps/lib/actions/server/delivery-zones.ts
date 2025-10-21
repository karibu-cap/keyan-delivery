import { calculatePolygonCentroid, geocodeAddress, isPointInPolygon } from '@/lib/coordinate-resolver';
import { prisma } from '@/lib/prisma';
import { CoordinateConfidence, CoordinateSource, Landmark, LongLat } from '@prisma/client';

export interface ResolvedCoordinates {
    coordinates: LongLat;
    source: CoordinateSource;
    confidence: CoordinateConfidence;
    landmark?: Landmark;
}

/**
 * Get all active delivery zones for a merchant
 */
export async function getActiveDeliveryZones() {
    try {
        const zones = await prisma.deliveryZone.findMany({
            where: {
                status: 'ACTIVE',
            },
            select: {
                id: true,
                name: true,
                code: true,
                deliveryFee: true,
                estimatedDeliveryMinutes: true,
                color: true,
                landmarks: true,
                description: true,
                priority: true,
            },
            orderBy: {
                priority: 'desc'
            }
        });

        return zones;
    } catch (error) {
        console.error({ message: 'Error fetching delivery zones:', error });
        return [];
    }
}

/**
 * Find delivery zone by coordinates (MongoDB 2dsphere query)
 * This is useful if you want to auto-detect zone from GPS coordinates
 */
export async function findDeliveryZoneByCoordinates(
    longitude: number,
    latitude: number,
) {
    try {
        // MongoDB $geoIntersects query
        const result = await prisma.$runCommandRaw({
            find: "DeliveryZone",
            filter: {
                geometry: {
                    $geoIntersects: {
                        $geometry: {
                            type: "Point",
                            coordinates: [longitude, latitude]
                        }
                    }
                },
                status: "ACTIVE",
            },
            sort: { priority: -1 },
            limit: 1
        });

        // @ts-expect-error - Raw MongoDB result
        const zones = result?.cursor?.firstBatch || [];
        return zones.length > 0 ? zones[0] : null;
    } catch (error) {
        console.error({ message: 'Error finding zone by coordinates:', error });
        return null;
    }
}

/**
 * Validate if an order meets zone requirements
 */
export async function validateOrderForZone(
    zoneId: string,
): Promise<{ valid: boolean; error?: string }> {
    try {
        const zone = await prisma.deliveryZone.findUnique({
            where: { id: zoneId }
        });

        if (!zone) {
            return { valid: false, error: 'Delivery zone not found' };
        }

        if (zone.status !== 'ACTIVE') {
            return { valid: false, error: 'This delivery zone is not currently available' };
        }

        return { valid: true };
    } catch (error) {
        console.error({ message: 'Error validating order for zone:', error });
        return { valid: false, error: 'Failed to validate delivery zone' };
    }
}

/**
 * Search neighborhoods within delivery zones
 */
export async function searchNeighborhoods(query: string) {
    try {
        const zones = await prisma.deliveryZone.findMany({
            where: {
                status: 'ACTIVE',
                landmarks: {
                    some: {
                        name: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    }
                }
            },
            select: {
                id: true,
                name: true,
                code: true,
                deliveryFee: true,
                estimatedDeliveryMinutes: true,
                color: true,
                landmarks: true
            }
        });

        // Filter neighborhoods that match the query
        return zones.map(zone => ({
            ...zone,
            matchedNeighborhoods: zone.landmarks.map(l => l.name).filter(n =>
                n.toLowerCase().includes(query.toLowerCase())
            )
        }));
    } catch (error) {
        console.error({ message: 'Error searching neighborhoods:', error });
        return [];
    }
}



/**
 * Find which zone contains the given coordinates
 * Uses Prisma to check against database directly
 */
export async function findZoneByCoordinates(
    coordinates: LongLat
): Promise<{ id: string; name: string; code: string } | null> {
    try {
        const zones = await prisma.deliveryZone.findMany({
            where: { status: 'ACTIVE' },
            select: {
                id: true,
                name: true,
                code: true,
                geometry: true
            }
        });

        // Check which zone contains the coordinates
        for (const zone of zones) {
            if (isPointInPolygon(coordinates, zone.geometry as any)) {
                return {
                    id: zone.id,
                    name: zone.name,
                    code: zone.code
                };
            }
        }

        return null;
    } catch (error) {
        console.error('Error finding zone by coordinates:', error);
        return null;
    }
}

/**
 * Validate if coordinates fall within ANY active delivery zone
 * Uses Prisma to check against database directly
 */
export async function validateCoordinatesInZones(
    coordinates: LongLat
): Promise<boolean> {
    const zone = await findZoneByCoordinates(coordinates);
    return zone !== null;
}


/**
 * Main function: Resolve delivery coordinates intelligently
 * Uses Prisma to fetch zone data directly by zoneId
 */
export async function resolveDeliveryCoordinates(
    zoneId: string,
    address: string,
    landmarkName?: string,
    manualCoordinates?: LongLat
): Promise<ResolvedCoordinates> {

    try {
        // Fetch zone with landmarks from database
        const zone = await prisma.deliveryZone.findUnique({
            where: { id: zoneId },
            select: {
                id: true,
                name: true,
                geometry: true,
                landmarks: true
            }
        });

        if (!zone) {
            throw new Error(`Zone ${zoneId} not found`);
        }

        // =====================================================================
        // Priority 0: MANUAL COORDINATES (Highest confidence)
        // User dropped a pin on the map - this is the most explicit location
        // =====================================================================
        if (manualCoordinates && Array.isArray(manualCoordinates) && manualCoordinates.length === 2) {
            console.log('📍 Using MANUAL coordinates (pin-dropped)');

            // Validate that manual coordinates are within the zone
            const isInZone = isPointInPolygon(manualCoordinates, zone.geometry as any);

            if (!isInZone) {
                console.warn(
                    `⚠️ Manual coordinates [${manualCoordinates[0]}, ${manualCoordinates[1]}] ` +
                    `are outside zone ${zone.name}. This might indicate user error or zone boundary issues.`
                );
                // Still use them, but log the warning for admin review
            } else {
                console.log('✅ Manual coordinates validated - within zone boundary');
            }

            return {
                coordinates: manualCoordinates,
                source: CoordinateSource.MANUAL,
                confidence: CoordinateConfidence.HIGH
            };
        }

        // =====================================================================
        // Priority 1: LANDMARK (High confidence)
        // User selected a predefined landmark from the dropdown
        // =====================================================================
        if (landmarkName && zone.landmarks) {
            console.log('🏷️ Checking for LANDMARK:', landmarkName);

            const landmark = (zone.landmarks).find((l) => l.name === landmarkName);

            if (landmark) {

                // Sanity check: landmark should be in zone
                const isInZone = isPointInPolygon(landmark.coordinates, zone.geometry as any);
                if (!isInZone) {
                    console.warn(`⚠️ Landmark "${landmark.name}" coordinates outside zone ${zone.name}`);
                } else {
                    console.log(`✅ Using LANDMARK: ${landmark.name}`);
                }

                return {
                    coordinates: landmark.coordinates,
                    source: CoordinateSource.LANDMARK,
                    confidence: CoordinateConfidence.HIGH,
                    landmark: landmark
                };
            }

            console.warn(`⚠️ Landmark ${landmarkName} not found in zone landmarks`);
        }

        // =====================================================================
        // Priority 2: GEOCODING (Medium confidence)
        // Try to geocode the user's text address
        // =====================================================================
        if (address && address.trim().length > 0) {
            console.log('🌍 Attempting GEOCODING for address:', address);

            try {
                const geocoded = await geocodeAddress(address, zone.name);

                if (geocoded) {
                    console.log(`📍 Geocoded coordinates: [${geocoded.lng}, ${geocoded.lat}]`);

                    // Validate geocoded coordinates are within the zone
                    const isInZone = isPointInPolygon(geocoded, zone.geometry as any);

                    if (isInZone) {
                        console.log('✅ Using GEOCODED coordinates - within zone boundary');
                        return {
                            coordinates: geocoded,
                            source: CoordinateSource.GEOCODED,
                            confidence: CoordinateConfidence.MEDIUM
                        };
                    } else {
                        console.warn(
                            `⚠️ Geocoded location [${geocoded.lng}, ${geocoded.lat}] ` +
                            `outside zone ${zone.name}, will use fallback`
                        );
                    }
                } else {
                    console.warn('⚠️ Geocoding returned no results');
                }
            } catch (error) {
                console.error('❌ Geocoding failed:', error);
            }
        }

        // =====================================================================
        // Priority 3: ZONE CENTROID (Fallback - lowest confidence)
        // Use the center point of the zone as last resort
        // =====================================================================
        console.log('📍 Using ZONE_CENTER fallback (zone centroid)');

        const centroid = calculatePolygonCentroid(zone.geometry as any);

        console.log(`✅ Zone centroid: [${centroid.lng}, ${centroid.lat}]`);

        return {
            coordinates: centroid,
            source: CoordinateSource.ZONE_CENTER,
            confidence: CoordinateConfidence.LOW
        };

    } catch (error) {
        console.error('❌ Error resolving coordinates:', error);
        throw error;
    }
}


