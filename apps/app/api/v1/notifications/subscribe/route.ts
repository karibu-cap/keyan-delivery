import { verifySession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const { subscription, userAgent } = body;

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json(
                { success: false, error: 'Invalid subscription data' },
                { status: 400 }
            );
        }

        const existingSubscription = await prisma.pushSubscription.findFirst({
            where: {
                id: user.id,
            },
        });

        if (existingSubscription) {
            const updated = await prisma.pushSubscription.update({
                where: { id: existingSubscription.id },
                data: {
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth,
                    userAgent: userAgent || existingSubscription.userAgent,
                    updatedAt: new Date(),
                    endpoint: subscription.endpoint,
                },
            });

            return NextResponse.json({
                success: true,
                message: 'Subscription updated',
                subscription: updated,
            });
        }

        const newSubscription = await prisma.pushSubscription.create({
            data: {
                userId: user.id,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
                userAgent: userAgent || 'Unknown',
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Subscription created',
            subscription: newSubscription,
        });
    } catch (error) {
        console.error('Error subscribing to push notifications:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to subscribe' },
            { status: 500 }
        );
    }
}