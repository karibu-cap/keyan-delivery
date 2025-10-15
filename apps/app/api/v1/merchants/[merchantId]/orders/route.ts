import { getMerchantOrders } from '@/lib/actions/server/merchants';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, props: { params: Promise<{ merchantId: string }> }) {
    const params = await props.params
    const merchantId = params.merchantId;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') || 'active') as 'active' | 'history';

    return await getMerchantOrders(merchantId, type);
}