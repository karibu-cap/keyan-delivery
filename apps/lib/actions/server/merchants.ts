
import { getUserTokens } from '@/lib/firebase-client/firebase-utils';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/utils';
import { MerchantType, OrderStatus, ProductStatus, UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';

/**
 * Get merchant statistics (complete logic including auth)
 */
export async function getMerchantStats(merchantId: string):Promise<NextResponse> {
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
}):Promise<NextResponse> {
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

        return NextResponse.json({
            success: true,
            data: merchant,
            message: 'Merchant application submitted successfully. Pending approval.',
        });
    } catch (error) {
        console.error('Error creating merchant application:', error);
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
):Promise<NextResponse> {
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
        console.error('Error fetching merchant products:', error);
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
):Promise<NextResponse> {
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
        console.error('Error fetching merchant orders:', error);
        return NextResponse.json(
            { success: false, orders: [], pendingCount: 0 },
            { status: 500 }
        );
    }
}

/**
 * Get merchant base on user id.
 */
export async function getMerchantById(merchantId: string):Promise<NextResponse> {
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
        console.error('Error fetching merchant:', error);
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
):Promise<NextResponse> {
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
