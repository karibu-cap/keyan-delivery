import { updateOrderStatus } from '@/lib/actions/server/merchants';
import { NextRequest, NextResponse } from 'next/server';


export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ merchantId: string, orderId: string }> }
) {
    const params = await props.params
    try {
        const body = await request.json();
        const { newStatus } = body;
        const orderId = params.orderId;

        if (!newStatus) {
            console.error('New status is required');
            return NextResponse.json(
                { success: false, error: 'New status is required' },
                { status: 400 }
            );
        }

        return await updateOrderStatus(orderId, newStatus, params.merchantId);

    } catch (error) {
        console.error('Error updating order status:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}