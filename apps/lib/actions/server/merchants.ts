
import { invalidateMerchantCache } from '@/lib/cache';
import { getUserTokens } from '@/lib/firebase-client/server-firebase-utils';
import { notifyClientOrderStatusChange, notifyDriverOrderReady } from '@/lib/notifications/push-service';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/utils';
import {
    CustomerInsight,
    DailyAnalytics,
    MerchantAnalytics,
    MerchantStats,
    OrderStatusBreakdown,
    TopProduct,
    type IOrderAnalytics,
} from '@/types/merchant_analytics';
import { MerchantType, OrderStatus, ProductStatus, UserRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function getMerchantWithUser(merchantId: string, authId: string) {
    const userMerchant = await prisma.userMerchantManager.findFirst({
        where: {
            merchantId,
            user: {
                authId,
            },
        },
        include: {
            merchant: true,
            user: {
                include: {
                    merchantManagers: {
                        include: {
                            merchant: true,
                        },
                    },
                },
            },
        },
    });

    return userMerchant;
}

/**
 * Get merchant statistics (complete logic including auth)
 */
export async function getMerchantStats(merchantId: string): Promise<NextResponse> {
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
            where: { authId: token.decodedToken.uid }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Verify merchant access
        const userMerchants = await prisma.userMerchantManager.findMany({
            where: { userId: user.id },
            include: { merchant: true }
        });

        if (userMerchants.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No merchant found' },
                { status: 403 }
            );
        }

        const merchant = userMerchants.find((um) => um.merchantId === merchantId)?.merchant;
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

        revalidatePath('/merchant');

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
        console.error({ message: 'Error fetching merchant stats:', error });
        return NextResponse.json(
            { success: false, error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}

/**
 * Create merchant application (complete logic including auth)
 */
export async function createMerchantApplication(applicationData: {
    businessName: string;
    phone: string;
    merchantType: string;
    latitude: number;
    longitude: number;
    logoUrl: string;
    bannerUrl?: string;
}): Promise<NextResponse> {
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

        const {
            businessName,
            phone,
            merchantType,
            latitude,
            longitude,
            logoUrl,
            bannerUrl,
        } = applicationData;

        // Check if user already has a pending or approved merchant application
        const existingMerchant = await prisma.userMerchantManager.findFirst({
            where: {
                userId: user.id,
            },
            include: {
                merchant: true,
            },
        });

        if (existingMerchant) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'You already have a merchant account or pending application'
                },
                { status: 400 }
            );
        }

        // Create merchant with pending status
        const merchant = await prisma.merchant.create({
            data: {
                businessName,
                slug: generateSlug(businessName),
                phone,
                merchantType: merchantType as MerchantType,
                logoUrl,
                bannerUrl,
                isVerified: false, // Pending approval
                address: {
                    latitude,
                    longitude,
                },
                managers: {
                    create: {
                        userId: user.id,
                    },
                },
            },
        });

        // Update user role to include merchant
        const currentRoles = user.roles || [UserRole.customer];
        if (!currentRoles.includes(UserRole.merchant)) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    roles: [...currentRoles, UserRole.merchant],
                },
            });
        }

        // Invalidate merchant cache after successful creation
        await invalidateMerchantCache();

        return NextResponse.json({
            success: true,
            data: merchant,
            message: 'Merchant application submitted successfully. Pending approval.',
        });
    } catch (error) {
        console.error({ message: 'Error creating merchant application:', error });
        return NextResponse.json(
            { success: false, error: 'Failed to submit merchant application' },
            { status: 500 }
        );
    }
}

/**
 * Get merchant products (complete logic including auth)
 */
export async function getMerchantProducts(
    merchantId: string,
    filters?: {
        status?: ProductStatus;
        search?: string;
        limit?: number;
        offset?: number;
    }
): Promise<NextResponse> {
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
            where: { authId: token.decodedToken.uid }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        const where: any = { merchantId };

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' as const } },
                { description: { contains: filters.search, mode: 'insensitive' as const } },
            ];
        }

        const products = await prisma.product.findMany({
            where,
            take: filters?.limit,
            skip: filters?.offset,
            include: {
                images: true,
                categories: {
                    include: {
                        category: true,
                    },
                },
                promotions: true,
                _count: {
                    select: {
                        OrderItem: true,
                        cartItems: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const total = await prisma.product.count({ where });

        return NextResponse.json({
            success: true,
            products,
            total,
            hasMore: filters?.offset ? (filters.offset + (filters?.limit || 0)) < total : false
        });
    } catch (error) {
        console.error({ message: 'Error fetching merchant products:', error });
        return NextResponse.json(
            { success: false, products: [], total: 0 },
            { status: 500 }
        );
    }
}

/**
 * Get merchant orders (complete logic including auth)
 */
export async function getMerchantOrders(
    merchantId: string,
    type: "active" | "history" = "active"
): Promise<NextResponse> {
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
            where: { authId: token.decodedToken.uid }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

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
                merchantId,
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
                merchantId,
                status: OrderStatus.PENDING,
            },
        });

        return NextResponse.json({
            success: true,
            orders,
            pendingCount,
        });
    } catch (error) {
        console.error({ message: 'Error fetching merchant orders:', error });
        return NextResponse.json(
            { success: false, orders: [], pendingCount: 0 },
            { status: 500 }
        );
    }
}

/**
 * Get merchant base on user id.
 */
export async function getMerchantById(merchantId: string): Promise<NextResponse> {
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
            where: { authId: token.decodedToken.uid }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        const merchant = await prisma.merchant.findUnique({
            where: { id: merchantId },
        });
        return NextResponse.json({ success: true, merchant });
    } catch (error) {
        console.error({ message: 'Error fetching merchant:', error });
        return NextResponse.json(
            { success: false, merchant: null },
            { status: 500 }
        );
    }
}

/**
 * Update order status (complete logic including auth)
 */
export async function updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    merchantId: string
): Promise<NextResponse> {
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

        // Find the order and verify it belongs to one of the user's merchants
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                merchantId: {
                    equals: merchantId,
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
            include: {
                merchant: true,
                user: true,
            },
        });



        try {
            console.info('✅Start notification-');
            // 1. Notify client for status change
            await notifyClientOrderStatusChange({
                authId: updatedOrder.user.authId,
                orderId,
                newStatus,
                merchantName: updatedOrder.merchant.businessName
            });
            console.info('✅ Status change notification sent to client');

            // 2. If order is ready to deliver, notify available drivers
            if (newStatus === OrderStatus.READY_TO_DELIVER) {
                const pickupAddress = `${updatedOrder.merchant.businessName}`;
                await notifyDriverOrderReady(
                    orderId,
                    updatedOrder.merchant.businessName,
                    pickupAddress,
                );
                console.info('✅ Order ready notification sent to drivers');
            }
        } catch (error) {
            console.error({ message: 'Error sending notifications:', error });
        }

        revalidatePath('/orders');
        revalidatePath(`/orders/${orderId}`);
        return NextResponse.json({
            success: true,
            order: updatedOrder,
        });
    } catch (error) {
        console.error({ message: 'Error updating order status:', error });
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

/**
 * Gets the merchant product based on product slug.
 */
export async function getMerchantProductBySlug(
    merchantSlug: string,
    productSlug: string
): Promise<NextResponse> {
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

        const merchant = await prisma.merchant.findUnique({
            where: { slug: merchantSlug },
        });

        if (!merchant) {
            return NextResponse.json(
                { success: false, error: 'Merchant not found' },
                { status: 404 }
            );
        }

        const product = await prisma.product.findFirst({
            where: {
                slug: productSlug,
                merchantId: merchant.id,
            },
            include: {
                images: true,
                categories: {
                    include: {
                        category: true,
                    },
                },
                promotions: true,
            },
        });

        if (!product) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, product });
    } catch (error) {
        console.error({ message: 'Error fetching product by slug:', error });
        return NextResponse.json(
            { success: false, error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}




export async function getMerchantAnalytics(
    merchantId: string,
    days: number = 30
): Promise<MerchantAnalytics> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get all orders from the period
    const orders = await prisma.order.findMany({
        where: {
            merchantId,
            createdAt: {
                gte: startDate,
            },
        },
        include: {
            items: {
                include: {
                    product: {
                        select: {
                            id: true,
                            title: true,
                            images: true,
                            categories: {
                                include: {
                                    category: {
                                        select: {
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            user: {
                select: {
                    id: true,
                    createdAt: true,
                },
            },
        },
        orderBy: {
            createdAt: 'asc',
        },
    });

    const dailyData = calculateDailyAnalytics(orders, days);

    const stats = calculateMerchantStats(dailyData);

    const topProducts = calculateTopProducts(orders);

    const customerInsights = calculateCustomerInsights(orders);

    const orderStatusBreakdown = calculateOrderStatusBreakdown(orders);

    const peakHours = calculatePeakHours(orders);

    return {
        dailyData,
        stats,
        topProducts,
        customerInsights,
        orderStatusBreakdown,
        peakHours,
    };
}

function calculateDailyAnalytics(orders: IOrderAnalytics[], days: number): DailyAnalytics[] {
    const dailyMap = new Map<string, DailyAnalytics>();

    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const dateKey = date.toISOString().split('T')[0];
        dailyMap.set(dateKey, {
            date,
            totalRevenue: 0,
            totalOrders: 0,
            completedOrders: 0,
            canceledOrders: 0,
            rejectedOrders: 0,
            pendingOrders: 0,
            averageOrderValue: 0,
            newCustomers: 0,
            returningCustomers: 0,
        });
    }

    const customersByDate = new Map<string, Set<string>>();
    const allCustomers = new Set<string>();

    orders.forEach((order) => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        const dateKey = orderDate.toISOString().split('T')[0];

        const dayData = dailyMap.get(dateKey);
        if (!dayData) return;

        dayData.totalOrders++;

        if (order.status === OrderStatus.COMPLETED) {
            dayData.completedOrders++;
            dayData.totalRevenue += order.orderPrices.total;
        } else if (
            order.status === OrderStatus.CANCELED_BY_MERCHANT ||
            order.status === OrderStatus.CANCELED_BY_DRIVER
        ) {
            dayData.canceledOrders++;
        } else if (
            order.status === OrderStatus.REJECTED_BY_MERCHANT ||
            order.status === OrderStatus.REJECTED_BY_DRIVER
        ) {
            dayData.rejectedOrders++;
        } else {
            dayData.pendingOrders++;
        }

        // Tracker les clients
        if (!customersByDate.has(dateKey)) {
            customersByDate.set(dateKey, new Set());
        }
        customersByDate.get(dateKey)!.add(order.userId);

        // Nouveau vs returning customer
        if (!allCustomers.has(order.userId)) {
            dayData.newCustomers++;
            allCustomers.add(order.userId);
        } else {
            dayData.returningCustomers++;
        }
    });

    dailyMap.forEach((dayData) => {
        if (dayData.completedOrders > 0) {
            dayData.averageOrderValue = dayData.totalRevenue / dayData.completedOrders;
        }
    });

    return Array.from(dailyMap.values()).sort(
        (a, b) => a.date.getTime() - b.date.getTime()
    );
}

function calculateMerchantStats(
    dailyData: DailyAnalytics[],
): MerchantStats {
    const totalRevenue = dailyData.reduce((sum, day) => sum + day.totalRevenue, 0);
    const totalOrders = dailyData.reduce((sum, day) => sum + day.totalOrders, 0);
    const completedOrders = dailyData.reduce((sum, day) => sum + day.completedOrders, 0);
    const canceledOrders = dailyData.reduce((sum, day) => sum + day.canceledOrders, 0);

    const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
    const cancelRate = totalOrders > 0 ? (canceledOrders / totalOrders) * 100 : 0;

    const midPoint = Math.floor(dailyData.length / 2);
    const recentData = dailyData.slice(midPoint);
    const previousData = dailyData.slice(0, midPoint);

    const recentRevenue = recentData.reduce((sum, day) => sum + day.totalRevenue, 0);
    const previousRevenue = previousData.reduce((sum, day) => sum + day.totalRevenue, 0);
    const revenueChange =
        previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    const recentOrders = recentData.reduce((sum, day) => sum + day.totalOrders, 0);
    const previousOrders = previousData.reduce((sum, day) => sum + day.totalOrders, 0);
    const ordersChange =
        previousOrders > 0 ? ((recentOrders - previousOrders) / previousOrders) * 100 : 0;

    const recentAvg =
        recentData.reduce((sum, day) => sum + day.averageOrderValue, 0) / recentData.length;
    const previousAvg =
        previousData.reduce((sum, day) => sum + day.averageOrderValue, 0) / previousData.length;
    const avgOrderChange = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

    return {
        totalRevenue,
        revenueChange,
        totalOrders,
        ordersChange,
        completedOrders,
        completionRate,
        averageOrderValue,
        avgOrderChange,
        canceledOrders,
        cancelRate,
    };
}

function calculateTopProducts(orders: IOrderAnalytics[]): TopProduct[] {
    const productMap = new Map<string,
        {
            name: string;
            image: string | null;
            quantity: number;
            revenue: number;
            orders: Set<string>;
            category?: string;
        }
    >();

    orders.forEach((order) => {
        if (order.status !== OrderStatus.COMPLETED) return;

        order.items.forEach((item: IOrderAnalytics['items'][number]) => {
            const productId = item.productId;
            const existing = productMap.get(productId);

            if (existing) {
                existing.quantity += item.quantity;
                existing.revenue += item.price * item.quantity;
                existing.orders.add(order.id);
            } else {
                productMap.set(productId, {
                    name: item.product.title,
                    image: item.product.images[0]?.url || null,
                    quantity: item.quantity,
                    revenue: item.price * item.quantity,
                    orders: new Set([order.id]),
                    category: item.product.categories[0]?.category?.name,
                });
            }
        });
    });

    return Array.from(productMap.entries())
        .map(([productId, data]) => ({
            productId,
            name: data.name,
            image: data.image,
            quantity: data.quantity,
            revenue: data.revenue,
            orders: data.orders.size,
            category: data.category,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
}

function calculateCustomerInsights(orders: IOrderAnalytics[]): CustomerInsight {
    const customerOrderMap = new Map<string, number>();
    let newCustomers = 0;

    orders.forEach((order) => {
        const count = customerOrderMap.get(order.userId) || 0;
        customerOrderMap.set(order.userId, count + 1);

        if (count === 0) {
            newCustomers++;
        }
    });

    const totalCustomers = customerOrderMap.size;
    const returningCustomers = totalCustomers - newCustomers;
    const totalOrdersCount = Array.from(customerOrderMap.values()).reduce(
        (sum, count) => sum + count,
        0
    );
    const averageOrdersPerCustomer =
        totalCustomers > 0 ? totalOrdersCount / totalCustomers : 0;

    return {
        totalCustomers,
        newCustomers,
        returningCustomers,
        averageOrdersPerCustomer,
    };
}

function calculateOrderStatusBreakdown(orders: IOrderAnalytics[]): OrderStatusBreakdown {
    const breakdown = {
        completed: 0,
        pending: 0,
        canceled: 0,
        rejected: 0,
        inPreparation: 0,
        readyToDeliver: 0,
        onTheWay: 0,
    };

    orders.forEach((order) => {
        switch (order.status) {
            case OrderStatus.COMPLETED:
                breakdown.completed++;
                break;
            case OrderStatus.PENDING:
            case OrderStatus.ACCEPTED_BY_MERCHANT:
            case OrderStatus.ACCEPTED_BY_DRIVER:
                breakdown.pending++;
                break;
            case OrderStatus.CANCELED_BY_MERCHANT:
            case OrderStatus.CANCELED_BY_DRIVER:
                breakdown.canceled++;
                break;
            case OrderStatus.REJECTED_BY_MERCHANT:
            case OrderStatus.REJECTED_BY_DRIVER:
                breakdown.rejected++;
                break;
            case OrderStatus.IN_PREPARATION:
                breakdown.inPreparation++;
                break;
            case OrderStatus.READY_TO_DELIVER:
                breakdown.readyToDeliver++;
                break;
            case OrderStatus.ON_THE_WAY:
                breakdown.onTheWay++;
                break;
        }
    });

    return breakdown;
}

function calculatePeakHours(orders: IOrderAnalytics[]): { hour: number; orders: number }[] {
    const hourMap = new Map<number, number>();

    for (let i = 0; i < 24; i++) {
        hourMap.set(i, 0);
    }

    orders.forEach((order) => {
        const hour = new Date(order.createdAt).getHours();
        hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
    });

    return Array.from(hourMap.entries())
        .map(([hour, orders]) => ({ hour, orders }))
        .sort((a, b) => b.orders - a.orders);
}