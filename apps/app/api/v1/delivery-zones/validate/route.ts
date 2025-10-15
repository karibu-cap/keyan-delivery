import { validateOrderForZone } from '@/lib/actions/server/delivery-zones';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/v1/delivery-zones/validate
 * Validate if an order meets zone requirements
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { zoneId } = body;

        // Validate required fields
        if (!zoneId) {
            return NextResponse.json(
                { success: false, error: 'Zone ID is required' },
                { status: 400 }
            );
        }


        const validation = await validateOrderForZone(zoneId);

        return NextResponse.json({
            success: true,
            data: validation,
            message: 'Zone validation completed'
        });
    } catch (error) {
        console.error('Error validating order for zone:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to validate delivery zone' },
            { status: 500 }
        );
    }
}