import { getUserTokens } from '@/lib/firebase-client/firebase-utils';
import { prisma } from '@/lib/prisma';
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

        const { searchParams } = new URL(request.url);
        const unreadOnly = searchParams.get('unreadOnly') === 'true';

        // Get pending orders count (main notification source)
        const pendingOrdersCount = await prisma.order.count({
            where: {
                merchantId,
                status: 'PENDING'
            }
        });

        // Get recent orders for notifications
        const recentOrders = await prisma.order.findMany({
            where: {
                merchantId,
                status: 'PENDING',
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
            },
            include: {
                user: {
                    select: {
                        fullName: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        // Get products needing attention (low stock, pending approval)
        const lowStockProducts = await prisma.product.findMany({
            where: {
                merchantId,
                stock: {
                    lte: 5
                },
                visibility: true
            },
            select: {
                id: true,
                title: true,
                stock: true
            },
            take: 5
        });

        const pendingProducts = await prisma.product.count({
            where: {
                merchantId,
                status: 'DRAFT'
            }
        });

        const notifications = [
            ...recentOrders.map(order => ({
                id: `order-${order.id}`,
                type: 'NEW_ORDER',
                title: 'New Order Received',
                message: `Order from ${order.user.fullName || 'Customer'} - $${order.orderPrices.total.toFixed(2)}`,
                link: `/merchant/${merchantId}`,
                createdAt: order.createdAt,
                read: false,
                priority: 'high'
            })),
            ...lowStockProducts.map(product => ({
                id: `stock-${product.id}`,
                type: 'LOW_STOCK',
                title: 'Low Stock Alert',
                message: `${product.title} - Only ${product.stock} left`,
                link: `/merchant/products/${product.id}/edit`,
                createdAt: new Date(),
                read: false,
                priority: 'medium'
            }))
        ];

        if (pendingProducts > 0) {
            notifications.push({
                id: 'pending-products',
                type: 'PENDING_PRODUCTS',
                title: 'Products Pending',
                message: `You have ${pendingProducts} draft product${pendingProducts > 1 ? 's' : ''} waiting to be submitted`,
                link: '/merchant/products',
                createdAt: new Date(),
                read: false,
                priority: 'low'
            });
        }

        // Sort by priority and date
        const sortedNotifications = notifications.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            if (a.priority !== b.priority) {
                return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return NextResponse.json({
            success: true,
            data: {
                notifications: unreadOnly ? sortedNotifications.filter(n => !n.read) : sortedNotifications,
                unreadCount: sortedNotifications.filter(n => !n.read).length,
                summary: {
                    pendingOrders: pendingOrdersCount,
                    lowStockProducts: lowStockProducts.length,
                    pendingProducts
                }
            }
        });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}