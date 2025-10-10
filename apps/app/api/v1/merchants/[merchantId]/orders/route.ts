import { getUserTokens } from '@/lib/firebase-client/firebase-utils';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, props: { params: Promise<{ merchantId: string }> }) {
    try {
        const params = await props.params
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

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const type = (searchParams.get('type') || 'active') as 'active' | 'history';

        const activeStatuses = [
            OrderStatus.PENDING,
            OrderStatus.ACCEPTED_BY_MERCHANT,
            OrderStatus.IN_PREPARATION,
            OrderStatus.READY_TO_DELIVER,
            OrderStatus.ACCEPTED_BY_DRIVER,
            OrderStatus.ON_THE_WAY,
        ];

        const historyStatuses = [
            OrderStatus.COMPLETED,
            OrderStatus.CANCELED_BY_MERCHANT,
            OrderStatus.CANCELED_BY_DRIVER,
            OrderStatus.REJECTED_BY_MERCHANT,
            OrderStatus.REJECTED_BY_DRIVER,
        ];

        const orders = await prisma.order.findMany({
            where: {
                merchantId: {
                    equals: params.merchantId,
                },
                status: {
                    in: type === 'active' ? activeStatuses : historyStatuses,
                },
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        phone: true,
                        email: true,
                    },
                },
            },
            orderBy: [
                ...(type === 'active' ? [{ status: 'asc' as const }] : []),
                { createdAt: 'desc' as const },
            ],
        });

        const pendingCount = await prisma.order.count({
            where: {
                merchantId: {
                    equals: params.merchantId,
                },
                status: OrderStatus.PENDING,
            },
        });

        return NextResponse.json({
            success: true,
            orders,
            pendingCount,
        });
    } catch (error) {
        console.error('Error fetching merchant orders:', error);
        return NextResponse.json(
            { success: false, orders: [], pendingCount: 0 },
            { status: 500 }
        );
    }
}