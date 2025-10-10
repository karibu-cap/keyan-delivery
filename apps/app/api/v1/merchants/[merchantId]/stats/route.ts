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

        const user = await prisma.user.findUnique({
            where: { authId: token.decodedToken.uid },
            include: {
                merchantManagers: {
                    include: {
                        merchant: true
                    }
                }
            }
        });

        if (!user || user.merchantManagers.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No merchant found' },
                { status: 403 }
            );
        }

        const merchantId = params.merchantId;
        const merchant = user.merchantManagers.find((um) => um.merchantId === merchantId)?.merchant;

        if (!merchant) {
            return NextResponse.json(
                { success: false, error: 'Merchant not found' },
                { status: 404 }
            );
        }

        // Date ranges
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // Total products
        const totalProducts = await prisma.product.count({
            where: { merchantId }
        });

        const activeProducts = await prisma.product.count({
            where: {
                merchantId,
                status: 'VERIFIED',
                visibility: true
            }
        });

        // Orders today
        const ordersToday = await prisma.order.count({
            where: {
                merchantId,
                createdAt: {
                    gte: startOfToday
                }
            }
        });

        const ordersTodayData = await prisma.order.findMany({
            where: {
                merchantId,
                createdAt: {
                    gte: startOfToday
                }
            },
            select: {
                orderPrices: true
            }
        });

        const revenueToday = ordersTodayData.reduce(
            (sum, order) => sum + order.orderPrices.total,
            0
        );

        // Monthly revenue
        const monthlyOrders = await prisma.order.findMany({
            where: {
                merchantId,
                status: OrderStatus.COMPLETED,
                createdAt: {
                    gte: startOfMonth
                }
            },
            select: {
                orderPrices: true
            }
        });

        const monthlyRevenue = monthlyOrders.reduce(
            (sum, order) => sum + order.orderPrices.total,
            0
        );

        // Last month revenue for comparison
        const lastMonthOrders = await prisma.order.findMany({
            where: {
                merchantId,
                status: OrderStatus.COMPLETED,
                createdAt: {
                    gte: startOfLastMonth,
                    lte: endOfLastMonth
                }
            },
            select: {
                orderPrices: true
            }
        });

        const lastMonthRevenue = lastMonthOrders.reduce(
            (sum, order) => sum + order.orderPrices.total,
            0
        );

        const revenueChange = lastMonthRevenue > 0
            ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
            : 0;

        // Pending orders
        const pendingOrders = await prisma.order.count({
            where: {
                merchantId,
                status: OrderStatus.PENDING
            }
        });

        // Average order value
        const avgOrderValue = monthlyOrders.length > 0
            ? monthlyRevenue / monthlyOrders.length
            : 0;

        // Top selling products
        const topProducts = await prisma.orderItem.groupBy({
            by: ['productId'],
            where: {
                order: {
                    merchantId,
                    status: OrderStatus.COMPLETED,
                    createdAt: {
                        gte: startOfMonth
                    }
                }
            },
            _sum: {
                quantity: true
            },
            _count: {
                id: true
            },
            orderBy: {
                _sum: {
                    quantity: 'desc'
                }
            },
            take: 5
        });

        const topProductsData = await Promise.all(
            topProducts.map(async (item) => {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        images: {
                            select: {
                                url: true
                            }
                        }
                    }
                });

                return {
                    ...product,
                    totalSold: item._sum.quantity || 0,
                    orderCount: item._count.id
                };
            })
        );

        // Orders by status
        const ordersByStatus = await prisma.order.groupBy({
            by: ['status'],
            where: {
                merchantId,
                createdAt: {
                    gte: startOfMonth
                }
            },
            _count: {
                id: true
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                overview: {
                    totalProducts,
                    activeProducts,
                    monthlyRevenue: monthlyRevenue.toFixed(2),
                    revenueChange: revenueChange.toFixed(1),
                    ordersToday,
                    revenueToday: revenueToday.toFixed(2),
                    pendingOrders,
                    avgOrderValue: avgOrderValue.toFixed(2),
                    storeRating: merchant.rating || 0,
                    totalOrders: monthlyOrders.length
                },
                topProducts: topProductsData,
                ordersByStatus: ordersByStatus.map(item => ({
                    status: item.status,
                    count: item._count.id
                })),
                trends: {
                    currentMonth: monthlyRevenue,
                    lastMonth: lastMonthRevenue,
                    growth: revenueChange
                }
            }
        });

    } catch (error) {
        console.error('Error fetching merchant stats:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}