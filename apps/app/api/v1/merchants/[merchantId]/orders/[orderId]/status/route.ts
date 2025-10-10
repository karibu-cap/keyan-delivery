import { getUserTokens } from '@/lib/firebase-client/firebase-utils';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ merchantId: string, orderId: string }> }
) {
    const params = await props.params
    try {
        const token = await getUserTokens();

        if (!token?.decodedToken?.uid) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Find user by Firebase UID
        const user = await prisma.user.findUnique({
            where: {
                authId: token.decodedToken.uid,
            },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { newStatus } = body;

        if (!newStatus) {
            return NextResponse.json(
                { success: false, error: 'New status is required' },
                { status: 400 }
            );
        }

        const orderId = params.orderId;

        // Find the order and verify it belongs to one of the user's merchants
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                merchantId: {
                    equals: params.merchantId,
                },
            },
        });

        if (!order) {
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            );
        }

        // Validate status transition
        const validTransitions: Record<OrderStatus, OrderStatus[]> = {
            PENDING: [OrderStatus.ACCEPTED_BY_MERCHANT, OrderStatus.REJECTED_BY_MERCHANT],
            ACCEPTED_BY_MERCHANT: [OrderStatus.IN_PREPARATION, OrderStatus.CANCELED_BY_MERCHANT],
            IN_PREPARATION: [OrderStatus.READY_TO_DELIVER, OrderStatus.CANCELED_BY_MERCHANT],
            READY_TO_DELIVER: [OrderStatus.ACCEPTED_BY_DRIVER, OrderStatus.CANCELED_BY_MERCHANT],
            ACCEPTED_BY_DRIVER: [OrderStatus.ON_THE_WAY, OrderStatus.CANCELED_BY_DRIVER],
            ON_THE_WAY: [OrderStatus.COMPLETED, OrderStatus.CANCELED_BY_DRIVER],
            REJECTED_BY_MERCHANT: [],
            REJECTED_BY_DRIVER: [],
            CANCELED_BY_MERCHANT: [],
            CANCELED_BY_DRIVER: [],
            COMPLETED: [],
        };

        if (!validTransitions[order.status].includes(newStatus as OrderStatus)) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Cannot transition from ${order.status} to ${newStatus}`
                },
                { status: 400 }
            );
        }

        const updateData: {
            status: OrderStatus;
            pickupCode?: string;
        } = {
            status: newStatus as OrderStatus,
        };

        // Generate pickup code when marking as ready
        if (newStatus === OrderStatus.READY_TO_DELIVER && !order.pickupCode) {
            updateData.pickupCode = Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase();
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            order: updatedOrder,
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}