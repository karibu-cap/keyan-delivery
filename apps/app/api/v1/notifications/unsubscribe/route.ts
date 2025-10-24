import { verifySession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { endpoint, userId } = body;

        if (!endpoint || !userId) {
            return NextResponse.json(
                { success: false, error: 'Endpoint and userId are required' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        await prisma.pushSubscription.deleteMany({
            where: {
                id: user.id,
                endpoint: endpoint,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Unsubscribed successfully',
        });
    } catch (error) {
        console.error('Error unsubscribing from push notifications:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to unsubscribe' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const token = await verifySession();

        if (!token?.user.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: token.user.id },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        const result = await prisma.pushSubscription.deleteMany({
            where: { id: user.id },
        });

        return NextResponse.json({
            success: true,
            message: `Deleted ${result.count} subscriptions`,
            count: result.count,
        });
    } catch (error) {
        console.error('Error deleting all subscriptions:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete subscriptions' },
            { status: 500 }
        );
    }
}