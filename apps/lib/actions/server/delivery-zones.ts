import { prisma } from '@/lib/prisma';

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
                neighborhoods: true,
                description: true,
                priority: true,
            },
            orderBy: {
                priority: 'desc'
            }
        });

        return zones;
    } catch (error) {
        console.error('Error fetching delivery zones:', error);
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
        console.error('Error finding zone by coordinates:', error);
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
        console.error('Error validating order for zone:', error);
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
                neighborhoods: {
                    hasSome: [query]
                }
            },
            select: {
                id: true,
                name: true,
                code: true,
                deliveryFee: true,
                estimatedDeliveryMinutes: true,
                neighborhoods: true,
                color: true,
            }
        });

        // Filter neighborhoods that match the query
        return zones.map(zone => ({
            ...zone,
            matchedNeighborhoods: zone.neighborhoods.filter(n =>
                n.toLowerCase().includes(query.toLowerCase())
            )
        }));
    } catch (error) {
        console.error('Error searching neighborhoods:', error);
        return [];
    }
}

/**
 * Get zone statistics (for admin dashboard)
 */
export async function getZoneStatistics() {
    try {
        const zones = await prisma.deliveryZone.findMany({
            where: { status: 'ACTIVE' },
            include: {
                orders: {
                    where: {
                        createdAt: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                        }
                    }
                }
            }
        });

        return zones.map(zone => ({
            id: zone.id,
            name: zone.name,
            code: zone.code,
            totalOrders: zone.orders.length,
            revenue: zone.orders.reduce((sum, order) => sum + order.orderPrices.total, 0),
            averageOrderValue: zone.orders.length > 0
                ? zone.orders.reduce((sum, order) => sum + order.orderPrices.total, 0) / zone.orders.length
                : 0,
            deliveryFee: zone.deliveryFee,
            neighborhoodCount: zone.neighborhoods.length,
        }));
    } catch (error) {
        console.error('Error getting zone statistics:', error);
        return [];
    }
}