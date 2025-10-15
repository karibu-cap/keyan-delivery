import { getZoneStatistics } from '@/lib/actions/server/delivery-zones';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/v1/delivery-zones/statistics
 * Get delivery zone statistics for admin dashboard
 */
export async function GET(request: NextRequest) {
    try {
        const statistics = await getZoneStatistics();

        return NextResponse.json({
            success: true,
            data: statistics,
            message: 'Zone statistics retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching zone statistics:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch zone statistics' },
            { status: 500 }
        );
    }
}