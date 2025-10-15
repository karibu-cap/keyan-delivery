import { findDeliveryZoneByCoordinates } from '@/lib/actions/server/delivery-zones';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/v1/delivery-zones/coordinates
 * Find delivery zone by GPS coordinates
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const longitude = parseFloat(searchParams.get('lng') || '');
        const latitude = parseFloat(searchParams.get('lat') || '');

        // Validate coordinates
        if (isNaN(longitude) || isNaN(latitude)) {
            return NextResponse.json(
                { success: false, error: 'Valid longitude (lng) and latitude (lat) parameters are required' },
                { status: 400 }
            );
        }

        // Basic coordinate range validation
        if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
            return NextResponse.json(
                { success: false, error: 'Coordinates are out of valid range' },
                { status: 400 }
            );
        }

        const zone = await findDeliveryZoneByCoordinates(longitude, latitude);

        return NextResponse.json({
            success: true,
            data: zone,
            message: zone ? 'Delivery zone found' : 'No delivery zone found for these coordinates'
        });
    } catch (error) {
        console.error('Error finding zone by coordinates:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to find delivery zone' },
            { status: 500 }
        );
    }
}