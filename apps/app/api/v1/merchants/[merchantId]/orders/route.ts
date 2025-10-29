import { getMerchantOrders } from '@/lib/actions/server/merchants';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, props: { params: Promise<{ merchantId: string }> }) {
    const params = await props.params
    const merchantId = params.merchantId;

    const orders = await getMerchantOrders(merchantId);

    if (!orders) {
        return NextResponse.json({
            success: false,
            message: 'Orders not found'
        }, { status: 403 });
    }

    return NextResponse.json({
        success: true,
        data: orders
    });
}