'use server';

import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';
import { requireAdmin } from './admin-guard';

interface DateRange {
    startDate: Date;
    endDate: Date;
}

// Get platform overview statistics
export async function getPlatformStats(dateRange?: DateRange) {
    await requireAdmin();

    const where = dateRange
        ? {
            createdAt: {
                gte: dateRange.startDate,
                lte: dateRange.endDate,
            },
        }
        : {};

    const [
        totalOrders,
        completedOrders,
        totalRevenue,
        totalUsers,
        totalMerchants,
        totalDrivers,
        totalProducts,
        activeZones,
        previousPeriodOrders,
    ] = await Promise.all([
        prisma.order.count({ where }),
        prisma.order.count({ where: { ...where, status: OrderStatus.COMPLETED } }),
        prisma.order.findMany({
            where: { ...where, status: OrderStatus.COMPLETED },
            select: { orderPrices: true },
        }),
        prisma.user.count({ where }),
        prisma.merchant.count({ where }),
        prisma.user.count({ where: { ...where, roles: { has: 'driver' } } }),
        prisma.product.count({ where }),
        prisma.deliveryZone.count({ where: { status: 'ACTIVE' } }),
        // Previous period for comparison
        dateRange
            ? prisma.order.count({
                where: {
                    createdAt: {
                        gte: new Date(
                            dateRange.startDate.getTime() -
                            (dateRange.endDate.getTime() - dateRange.startDate.getTime())
                        ),
                        lt: dateRange.startDate,
                    },
                },
            })
            : 0,
    ]);

    const revenue = totalRevenue.reduce((sum, order) => sum + (order.orderPrices?.total || 0), 0);

    // Calculate growth percentage
    const orderGrowth =
        previousPeriodOrders > 0
            ? ((totalOrders - previousPeriodOrders) / previousPeriodOrders) * 100
            : 0;

    return {
        totalOrders,
        completedOrders,
        revenue,
        totalUsers,
        totalMerchants,
        totalDrivers,
        totalProducts,
        activeZones,
        orderGrowth,
        completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
    };
}

// Get orders by status
export async function getOrdersByStatus(dateRange?: DateRange) {
    await requireAdmin();

    const where = dateRange
        ? {
            createdAt: {
                gte: dateRange.startDate,
                lte: dateRange.endDate,
            },
        }
        : {};

    const orders = await prisma.order.groupBy({
        by: ['status'],
        where,
        _count: {
            status: true,
        },
    });

    return orders.map((item) => ({
        status: item.status,
        count: item._count.status,
    }));
}

// Get revenue over time (daily/weekly/monthly)
export async function getRevenueOverTime(
    dateRange: DateRange,
    groupBy: 'day' | 'week' | 'month' = 'day'
) {
    await requireAdmin();

    const orders = await prisma.order.findMany({
        where: {
            createdAt: {
                gte: dateRange.startDate,
                lte: dateRange.endDate,
            },
            status: OrderStatus.COMPLETED,
        },
        select: {
            createdAt: true,
            orderPrices: true,
        },
    });

    // Group by date
    const revenueByDate = orders.reduce((acc, order) => {
        let dateKey: string;
        const date = new Date(order.createdAt);

        if (groupBy === 'day') {
            dateKey = date.toISOString().split('T')[0];
        } else if (groupBy === 'week') {
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            dateKey = weekStart.toISOString().split('T')[0];
        } else {
            dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }

        if (!acc[dateKey]) {
            acc[dateKey] = 0;
        }
        acc[dateKey] += order.orderPrices?.total || 0;

        return acc;
    }, {} as Record<string, number>);

    return Object.entries(revenueByDate)
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date));
}

// Get top performing merchants
export async function getTopMerchants(dateRange?: DateRange, limit = 10) {
    await requireAdmin();

    const where = dateRange
        ? {
            createdAt: {
                gte: dateRange.startDate,
                lte: dateRange.endDate,
            },
        }
        : {};

    const merchants = await prisma.merchant.findMany({
        select: {
            id: true,
            businessName: true,
            _count: {
                select: {
                    order: {
                        where: { ...where, status: OrderStatus.COMPLETED },
                    },
                },
            },
            order: {
                where: { ...where, status: OrderStatus.COMPLETED },
                select: {
                    orderPrices: true,
                },
            },
        },
    });

    return merchants
        .map((merchant) => ({
            id: merchant.id,
            name: merchant.businessName,
            orderCount: merchant._count.order,
            revenue: merchant.order.reduce((sum, order) => sum + (order.orderPrices?.total || 0), 0),
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);
}

// Get top performing drivers
export async function getTopDrivers(dateRange?: DateRange, limit = 10) {
    await requireAdmin();

    const where = dateRange
        ? {
            createdAt: {
                gte: dateRange.startDate,
                lte: dateRange.endDate,
            },
            status: OrderStatus.COMPLETED,
        }
        : { status: OrderStatus.COMPLETED };

    const orders = await prisma.order.groupBy({
        by: ['driverId'],
        where: {
            ...where,
            driverId: { not: null },
        },
        _count: {
            id: true,
        },
    });

    const driverStats = await Promise.all(
        orders.map(async (item) => {
            const driver = await prisma.user.findUnique({
                where: { id: item.driverId! },
                select: { name: true, email: true },
            });

            return {
                driverId: item.driverId!,
                name: driver?.name || driver?.email || 'Unknown',
                deliveryCount: item._count.id,
            };
        })
    );

    return driverStats.sort((a, b) => b.deliveryCount - a.deliveryCount).slice(0, limit);
}

// Get recent activities
export async function getRecentActivities(limit = 20) {
    await requireAdmin();

    const [recentOrders, recentUsers, recentProducts] = await Promise.all([
        prisma.order.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                status: true,
                createdAt: true,
                user: { select: { name: true, email: true } },
                merchant: { select: { businessName: true } },
                orderPrices: true,
            },
        }),
        prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                roles: true,
            },
        }),
        prisma.product.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                createdAt: true,
                merchant: { select: { businessName: true } },
            },
        }),
    ]);

    // Combine and sort all activities
    const activities = [
        ...recentOrders.map((order) => ({
            type: 'order' as const,
            id: order.id,
            description: `New order from ${order.user.name || order.user.email} at ${order.merchant.businessName}`,
            amount: order.orderPrices?.total,
            status: order.status,
            createdAt: order.createdAt,
        })),
        ...recentUsers.map((user) => ({
            type: 'user' as const,
            id: user.id,
            description: `New user registered: ${user.name || user.email}`,
            roles: user.roles,
            createdAt: user.createdAt,
        })),
        ...recentProducts.map((product) => ({
            type: 'product' as const,
            id: product.id,
            description: `New product added: ${product.title} by ${product.merchant.businessName}`,
            createdAt: product.createdAt,
        })),
    ];
    const now = new Date();
    return activities.sort((a, b) => (b.createdAt?.getTime() || now.getTime()) - (a.createdAt?.getTime() || now.getTime())).slice(0, limit);
}

export async function getPopularProducts(dateRange?: DateRange, limit = 10) {
    await requireAdmin();

    const where = dateRange
        ? {
            createdAt: {
                gte: dateRange.startDate,
                lte: dateRange.endDate,
            },
        }
        : {};

    const orderItems = await prisma.orderItem.findMany({
        where: {
            order: where,
        },
        select: {
            productId: true,
            quantity: true,
            product: {
                select: {
                    title: true,
                    price: true,
                },
            },
        },
    });

    const productStats = orderItems.reduce((acc, item) => {
        if (!acc[item.productId]) {
            acc[item.productId] = {
                productId: item.productId,
                title: item.product.title,
                price: item.product.price,
                totalQuantity: 0,
                revenue: 0,
            };
        }
        acc[item.productId].totalQuantity += item.quantity;
        acc[item.productId].revenue += item.quantity * item.product.price;
        return acc;
    }, {} as Record<string, any>);

    return Object.values(productStats)
        .sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
        .slice(0, limit);
}