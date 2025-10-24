'use server';

import { prisma } from '@/lib/prisma';
import { ZoneCode, ZoneStatus, type Landmark, type LongLat } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from './admin-guard';

// Geocode an address to get coordinates
export async function geocodeAddress(address: string): Promise<LongLat | null> {
    try {
        const query = encodeURIComponent(address);
        const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

        const response = await fetch(url, {
            headers: { 'User-Agent': 'DeliveryApp/1.0' },
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error('Geocoding API error:', response.status);
            return null;
        }

        const data = await response.json();

        if (data && data[0]) {
            return {
                lng: parseFloat(data[0].lon),
                lat: parseFloat(data[0].lat),
            };
        }
    } catch (error) {
        console.error('Geocoding error:', error);
    }

    return null;
}

// Reverse geocode coordinates to address
export async function reverseGeocode(lng: number, lat: number): Promise<string | null> {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

        const response = await fetch(url, {
            headers: { 'User-Agent': 'DeliveryApp/1.0' },
            cache: 'no-store',
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.display_name || null;
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
}

// Get all delivery zones
export async function getAllZones() {
    await requireAdmin();

    const zones = await prisma.deliveryZone.findMany({
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    return zones;
}

// Get single zone by ID
export async function getZoneById(zoneId: string) {
    await requireAdmin();

    const zone = await prisma.deliveryZone.findUnique({
        where: { id: zoneId },
    });

    return zone;
}

// Check if zone code already exists
async function checkDuplicateZone(code: ZoneCode, name: string, excludeId?: string) {
    const existingZone = await prisma.deliveryZone.findFirst({
        where: {
            OR: [
                { code },
                { name: { equals: name, mode: 'insensitive' } },
            ],
            ...(excludeId && { id: { not: excludeId } }),
        },
    });

    return existingZone;
}

interface CreateZoneData {
    name: string;
    code: ZoneCode;
    description?: string;
    deliveryFee: number;
    estimatedDeliveryMinutes?: number;
    minOrderAmount?: number;
    color: string;
    priority: number;
    status: ZoneStatus;
    geometry: {
        type: string;
        coordinates: number[][][];
    };
    landmarks: Landmark[];
}

// Create new delivery zone
export async function createZone(data: CreateZoneData) {
    await requireAdmin();

    // Check for duplicates
    const duplicate = await checkDuplicateZone(data.code, data.name);
    if (duplicate) {
        throw new Error(`A zone with code "${data.code}" or name "${data.name}" already exists`);
    }

    const zone = await prisma.deliveryZone.create({
        data: {
            name: data.name,
            code: data.code,
            description: data.description,
            deliveryFee: data.deliveryFee,
            estimatedDeliveryMinutes: data.estimatedDeliveryMinutes,
            minOrderAmount: data.minOrderAmount,
            color: data.color,
            priority: data.priority,
            status: data.status,
            geometry: data.geometry,
            landmarks: data.landmarks,
        },
    });

    revalidatePath('/admin/zones');
    return zone;
}

// Update existing delivery zone
export async function updateZone(zoneId: string, data: Partial<CreateZoneData>) {
    await requireAdmin();

    // Check for duplicates if name or code changed
    if (data.code || data.name) {
        const duplicate = await checkDuplicateZone(
            data.code || '' as ZoneCode,
            data.name || '',
            zoneId
        );
        if (duplicate) {
            throw new Error(`A zone with code "${data.code}" or name "${data.name}" already exists`);
        }
    }

    const zone = await prisma.deliveryZone.update({
        where: { id: zoneId },
        data: {
            ...(data.name && { name: data.name }),
            ...(data.code && { code: data.code }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.deliveryFee !== undefined && { deliveryFee: data.deliveryFee }),
            ...(data.estimatedDeliveryMinutes !== undefined && {
                estimatedDeliveryMinutes: data.estimatedDeliveryMinutes,
            }),
            ...(data.minOrderAmount !== undefined && { minOrderAmount: data.minOrderAmount }),
            ...(data.color && { color: data.color }),
            ...(data.priority !== undefined && { priority: data.priority }),
            ...(data.status && { status: data.status }),
            ...(data.geometry && { geometry: data.geometry }),
            ...(data.landmarks && { landmarks: data.landmarks }),
            version: { increment: 1 },
        },
    });

    revalidatePath('/admin/zones');
    revalidatePath(`/admin/zones/${zoneId}/edit`);
    return zone;
}

// Delete delivery zone
export async function deleteZone(zoneId: string) {
    await requireAdmin();

    // Check if zone has orders
    const ordersCount = await prisma.order.count({
        where: { deliveryZoneId: zoneId },
    });

    if (ordersCount > 0) {
        throw new Error('Cannot delete zone with existing orders. Set status to INACTIVE instead.');
    }

    await prisma.deliveryZone.delete({
        where: { id: zoneId },
    });

    revalidatePath('/admin/zones');
    return { success: true };
}

// Add landmark to zone
export async function addLandmark(
    zoneId: string,
    landmark: { name: string; address: string; category?: string; isPopular: boolean }
) {
    await requireAdmin();

    // Geocode the landmark address
    const coordinates = await geocodeAddress(landmark.address);
    if (!coordinates) {
        throw new Error('Could not geocode landmark address');
    }

    const zone = await prisma.deliveryZone.findUnique({
        where: { id: zoneId },
    });

    if (!zone) {
        throw new Error('Zone not found');
    }

    const newLandmark: Landmark = {
        name: landmark.name,
        coordinates,
        category: landmark.category || 'general',
        isPopular: landmark.isPopular,
    };

    const updatedLandmarks = [...(zone.landmarks || []), newLandmark];

    await prisma.deliveryZone.update({
        where: { id: zoneId },
        data: {
            landmarks: updatedLandmarks,
            version: { increment: 1 },
        },
    });

    revalidatePath(`/admin/zones/${zoneId}/edit`);
    return newLandmark;
}

// Update landmark
export async function updateLandmark(
    zoneId: string,
    landmarkIndex: number,
    updates: { name?: string; address?: string; category?: string; isPopular?: boolean }
) {
    await requireAdmin();

    const zone = await prisma.deliveryZone.findUnique({
        where: { id: zoneId },
    });

    if (!zone || !zone.landmarks) {
        throw new Error('Zone or landmarks not found');
    }

    const landmarks = [...zone.landmarks];
    const landmark = landmarks[landmarkIndex];

    if (!landmark) {
        throw new Error('Landmark not found');
    }

    // If address changed, re-geocode
    let coordinates = landmark.coordinates;
    if (updates.address) {
        const newCoordinates = await geocodeAddress(updates.address);
        if (!newCoordinates) {
            throw new Error('Could not geocode new address');
        }
        coordinates = newCoordinates;
    }

    landmarks[landmarkIndex] = {
        name: updates.name || landmark.name,
        coordinates,
        category: updates.category || landmark.category,
        isPopular: updates.isPopular !== undefined ? updates.isPopular : landmark.isPopular,
    };

    await prisma.deliveryZone.update({
        where: { id: zoneId },
        data: {
            landmarks,
            version: { increment: 1 },
        },
    });

    revalidatePath(`/admin/zones/${zoneId}/edit`);
    return landmarks[landmarkIndex];
}

// Delete landmark
export async function deleteLandmark(zoneId: string, landmarkIndex: number) {
    await requireAdmin();

    const zone = await prisma.deliveryZone.findUnique({
        where: { id: zoneId },
    });

    if (!zone || !zone.landmarks) {
        throw new Error('Zone or landmarks not found');
    }

    const landmarks = [...zone.landmarks];
    landmarks.splice(landmarkIndex, 1);

    await prisma.deliveryZone.update({
        where: { id: zoneId },
        data: {
            landmarks,
            version: { increment: 1 },
        },
    });

    revalidatePath(`/admin/zones/${zoneId}/edit`);
    return { success: true };
}

// Get zone statistics
export async function getZoneStats(zoneId: string) {
    await requireAdmin();

    const [zone, ordersCount, totalRevenue] = await Promise.all([
        prisma.deliveryZone.findUnique({
            where: { id: zoneId },
        }),
        prisma.order.count({
            where: { deliveryZoneId: zoneId },
        }),
        prisma.order.findMany({
            where: {
                deliveryZoneId: zoneId,
                status: 'COMPLETED',
            },
            select: {
                orderPrices: true,
            },
        }),
    ]);

    const total = totalRevenue.reduce((accumulator, order) => {
        return accumulator + (order.orderPrices?.total ?? 0);
    }, 0);

    return {
        zone,
        ordersCount,
        totalRevenue: total
    };
}