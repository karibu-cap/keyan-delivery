'use server'

import { prisma } from "@/lib/prisma";
import { Order, OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order | null> {
    try {
        const order = await prisma.order.create({
            data: orderData
        });

        // Revalidate relevant paths
        revalidatePath('/orders');
        revalidatePath(`/orders/${order.id}`);

        return order;
    } catch (error) {
        console.error({ message: 'Error creating order:', error });
        return null;
    }
}

export async function getOrder(orderId: string): Promise<Order | null> {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: true,
                merchant: true,
                user: true,
            }
        });

        return order;
    } catch (error) {
        console.error({ message: `Error fetching order ${orderId}:`, error });
        return null;
    }
}

export async function updateOrder(
    orderId: string,
    updates: Partial<Order>
): Promise<Order | null> {
    try {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: updates
        });

        // Revalidate paths
        revalidatePath('/orders');
        revalidatePath(`/orders/${orderId}`);

        return order;
    } catch (error) {
        console.error({ message: `Error updating order ${orderId}:`, error });
        return null;
    }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
    try {
        const orders = await prisma.order.findMany({
            where: {
                OR: [
                    { userId: userId },
                    { merchantId: userId },
                    { driverId: userId }
                ]
            },
            include: {
                items: true,
                merchant: true,
                user: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return orders;
    } catch (error) {
        console.error({ message: `Error fetching orders for user ${userId}:`, error });
        return [];
    }
}

export async function cancelOrderByMerchand(orderId: string): Promise<Order | null> {
    try {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: OrderStatus.CANCELED_BY_MERCHANT
            }
        });

        // Revalidate paths
        revalidatePath('/orders');
        revalidatePath(`/orders/${orderId}`);

        return order;
    } catch (error) {
        console.error({ message: `Error cancelling order ${orderId}:`, error });
        return null;
    }
}