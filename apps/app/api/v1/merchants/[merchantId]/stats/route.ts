import { getMerchantStats } from '@/lib/actions/server/merchants';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, props: { params: Promise<{ merchantId: string }> }) {
    const params = await props.params
    const merchantId = params.merchantId;

    return await getMerchantStats(merchantId);
}