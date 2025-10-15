import { getActiveDeliveryZones } from '@/lib/actions/server/delivery-zones';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/v1/delivery-zones
 * Get all active delivery zones
 */
export async function GET(_: NextRequest) {
    try {
        const zones = await getActiveDeliveryZones();

        return NextResponse.json({
            success: true,
            data: zones,
            message: 'Delivery zones retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching delivery zones:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch delivery zones' },
            { status: 500 }
        );
    }
}