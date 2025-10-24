// app/api/v1/driver/analytics/route.ts
// API endpoint to fetch driver analytics for a date range

import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { calculateDeliveryTime } from '@/lib/utils/distance';
import { OrderStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get driver from authId
        const driver = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true },
        });

        if (!driver) {
            return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
        }

        // Get date range from query params
        const searchParams = request.nextUrl.searchParams;
        const fromDate = searchParams.get('from');
        const toDate = searchParams.get('to');

        if (!fromDate || !toDate) {
            return NextResponse.json({ error: 'Date range required' }, { status: 400 });
        }

        const from = new Date(fromDate);
        const to = new Date(toDate);

        // Calculate previous period for comparison
        const periodDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
        const previousFrom = new Date(from);
        previousFrom.setDate(previousFrom.getDate() - periodDays);
        const previousTo = new Date(from);

        // Fetch orders for current period
        const orders = await prisma.order.findMany({
            where: {
                driverId: driver.id,
                createdAt: {
                    gte: from,
                    lte: to,
                },
            },
            select: {
                id: true,
                status: true,
                createdAt: true,
                driverStatusHistories: true,
                driverTotalDistanceInKilometers: true,
                onTimeDelivery: true,
                orderPrices: {
                    select: {
                        deliveryFee: true,
                    },
                },
            },
        });

        // Fetch orders for previous period
        const previousOrders = await prisma.order.findMany({
            where: {
                driverId: driver.id,
                createdAt: {
                    gte: previousFrom,
                    lt: previousTo,
                },
            }
        });

        // Calculate stats
        const totalDeliveries = orders.length;
        const completedDeliveries = orders.filter(o => o.status === OrderStatus.COMPLETED).length;
        const inProgressDeliveries = orders.filter(o =>
            o.status === OrderStatus.ACCEPTED_BY_DRIVER ||
            o.status === OrderStatus.ON_THE_WAY
        ).length;
        const readyDeliveries = orders.filter(o => o.status === OrderStatus.READY_TO_DELIVER).length;
        const canceledDeliveries = orders.filter(o =>
            o.status === OrderStatus.CANCELED_BY_DRIVER ||
            o.status === OrderStatus.CANCELED_BY_MERCHANT
        ).length;

        const totalEarnings = orders.reduce((sum, order) =>
            sum + (order.orderPrices?.deliveryFee || 0), 0
        );
        const avgEarningsPerDelivery = totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0;

        // Previous period stats
        const previousTotalDeliveries = previousOrders.length;
        const previousCompletedDeliveries = previousOrders.filter(o => o.status === OrderStatus.COMPLETED).length;
        const previousTotalEarnings = previousOrders.reduce((sum, order) =>
            sum + (order.orderPrices?.deliveryFee || 0), 0
        );
        const previousAvgEarnings = previousTotalDeliveries > 0 ? previousTotalEarnings / previousTotalDeliveries : 0;

        // Calculate changes
        const deliveriesChange = previousTotalDeliveries > 0
            ? ((totalDeliveries - previousTotalDeliveries) / previousTotalDeliveries) * 100
            : 0;
        const completedChange = previousCompletedDeliveries > 0
            ? ((completedDeliveries - previousCompletedDeliveries) / previousCompletedDeliveries) * 100
            : 0;
        const earningsChange = previousTotalEarnings > 0
            ? ((totalEarnings - previousTotalEarnings) / previousTotalEarnings) * 100
            : 0;
        const avgEarningsChange = previousAvgEarnings > 0
            ? ((avgEarningsPerDelivery - previousAvgEarnings) / previousAvgEarnings) * 100
            : 0;

        // Group by date for chart
        const dailyData = [];
        const currentDate = new Date(from);
        while (currentDate <= to) {
            const dayOrders = orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate.toDateString() === currentDate.toDateString();
            });

            const dayEarnings = dayOrders.reduce((sum, order) =>
                sum + (order.orderPrices?.deliveryFee || 0), 0
            );

            dailyData.push({
                date: currentDate.toISOString(),
                earnings: dayEarnings,
                deliveries: dayOrders.length,
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Calculate performance metrics
        const completionRate = totalDeliveries > 0
            ? (completedDeliveries / totalDeliveries) * 100
            : 0;

        // Calculate real distance and delivery time from tracking history
        let totalDistance = 0;
        let totalDeliveryTime = 0;
        let ordersWithTracking = 0;
        let onTimeDeliveries = 0;

        orders.forEach(async order => {
            if (order.driverTotalDistanceInKilometers) {
                const driverStatusHistory = order.driverStatusHistories;

                const distance = order.driverTotalDistanceInKilometers;
                totalDistance += distance;

                // Calculate delivery time for completed orders
                if (order.status === OrderStatus.COMPLETED) {
                    const deliveryTime = calculateDeliveryTime(driverStatusHistory);
                    totalDeliveryTime += deliveryTime;
                    ordersWithTracking++;

                    if (order.onTimeDelivery === true) {
                        onTimeDeliveries++
                    }
                }

            }
        });

        // orders.forEach(async order => {
        //     if (order.driverTrackingHistory && Array.isArray(order.driverTrackingHistory)) {
        //         const trackingHistory = order.driverTrackingHistory as any[];
        //         if (trackingHistory.length >= 2) {
        //             // Calculate distance for this order
        //             const distance = await calculateTotalDistance(trackingHistory);
        //             totalDistance += distance;

        //             // Calculate delivery time for completed orders
        //             if (order.status === OrderStatus.COMPLETED) {
        //                 const deliveryTime = calculateDeliveryTime(trackingHistory);
        //                 totalDeliveryTime += deliveryTime;
        //                 ordersWithTracking++;
        //             }
        //         }
        //     }
        // });

        const avgDeliveryTime = ordersWithTracking > 0
            ? Math.round(totalDeliveryTime / ordersWithTracking)
            : 0;

        const analytics = {
            totalDeliveries,
            completedDeliveries,
            totalEarnings,
            avgEarningsPerDelivery,
            deliveriesChange,
            completedChange,
            earningsChange,
            avgEarningsChange,
            deliveryStatusBreakdown: {
                total: totalDeliveries,
                completed: completedDeliveries,
                inProgress: inProgressDeliveries,
                ready: readyDeliveries,
                canceled: canceledDeliveries,
            },
            dailyData,
            completionRate,
            avgDeliveryTime,
            totalDistance: parseFloat(totalDistance.toFixed(2)),
            onTimeDeliveries: onTimeDeliveries,
            avgRating: 4.5, // Mock - would need actual ratings system
        };

        return NextResponse.json(analytics);
    } catch (error) {
        console.error('Error fetching driver analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
