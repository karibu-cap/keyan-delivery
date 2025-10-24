// app/api/v1/driver/profile/stats/route.ts
// API endpoint to fetch driver profile statistics

import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await getSession();
        const authId = session?.user.id;

        if (!authId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get driver from authId
        const driver = await prisma.user.findUnique({
            where: { id: authId },
            select: { id: true },
        });

        if (!driver) {
            return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
        }

        // Get current month date range
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Fetch orders for current month
        const ordersThisMonth = await prisma.order.findMany({
            where: {
                driverId: driver.id,
                createdAt: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
            },
            select: {
                id: true,
                status: true,
                createdAt: true,
                orderPrices: {
                    select: {
                        deliveryFee: true,
                    },
                },
            },
        });

        // Calculate earnings this month
        const earningsThisMonth = ordersThisMonth.reduce((sum, order) =>
            sum + (order.orderPrices?.deliveryFee || 0), 0
        );

        // Calculate active days (days with at least one delivery)
        const activeDaysSet = new Set(
            ordersThisMonth
                .filter(o => o.status === OrderStatus.COMPLETED)
                .map(o => new Date(o.createdAt).toDateString())
        );
        const activeDays = activeDaysSet.size;

        // Fetch all completed orders for rating calculation
        const allOrders = await prisma.order.findMany({
            where: {
                driverId: driver.id,
            },
        });

        const totalDeliveries = allOrders.length;
        const completedDeliveries = allOrders.filter(o => o.status === OrderStatus.COMPLETED).length;
        const completionRate = totalDeliveries > 0 ? (completedDeliveries / totalDeliveries) * 100 : 0;

        // Calculate on-time rate ()
        const onTimeDeliveries = Math.floor(allOrders.filter(element => { element.onTimeDelivery == true }).length * completedDeliveries / 100);
        const onTimeRate = completedDeliveries > 0 ? (onTimeDeliveries / completedDeliveries) * 100 : 0;

        // Mock rating (would need actual rating system)
        const avgRating = 4.8;
        const totalReviews = Math.floor(completedDeliveries * 0.2); // ~20% of deliveries have reviews

        const stats = {
            // Profile stats cards
            earningsThisMonth,
            activeDays,
            avgRating,

            // Performance overview
            rating: avgRating,
            totalReviews,
            totalDeliveries,
            completionRate: parseFloat(completionRate.toFixed(1)),
            onTimeRate: parseFloat(onTimeRate.toFixed(1)),
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching driver profile stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch profile stats' },
            { status: 500 }
        );
    }
}
