import { getUserTokens } from '@/lib/firebase-client/server-firebase-utils';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const token = await getUserTokens();

        if (!token?.decodedToken?.uid) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { authId: token.decodedToken.uid },
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
                authId: user.authId,
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
                authId: user.authId,
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