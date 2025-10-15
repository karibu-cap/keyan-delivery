import { createMerchantApplication } from '@/lib/actions/server/merchants';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const {
        businessName,
        phone,
        merchantType,
        latitude,
        longitude,
        logoUrl,
        bannerUrl,
    } = body;

    // Validate required fields
    if (!businessName || !phone || !merchantType || !latitude || !longitude || !logoUrl) {
        return new Response(
            JSON.stringify({ success: false, error: 'Missing required fields' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    return await createMerchantApplication({
        businessName,
        phone,
        merchantType,
        latitude,
        longitude,
        logoUrl,
        bannerUrl,
    });
}