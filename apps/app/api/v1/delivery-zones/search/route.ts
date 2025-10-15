import { searchNeighborhoods } from '@/lib/actions/server/delivery-zones';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/v1/delivery-zones/search
 * Search neighborhoods within delivery zones
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json(
                { success: false, error: 'Search query parameter (q) is required' },
                { status: 400 }
            );
        }

        const zones = await searchNeighborhoods(query);

        return NextResponse.json({
            success: true,
            data: zones,
            message: 'Neighborhood search completed successfully'
        });
    } catch (error) {
        console.error('Error searching neighborhoods:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to search neighborhoods' },
            { status: 500 }
        );
    }
}