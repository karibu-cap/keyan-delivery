"use server";

import { getUserTokens } from "@/lib/firebase-client/server-firebase-utils";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { getLocale } from "next-intl/server";
import { notifyClientOrderStatusChange } from "../notifications/push-service";

export async function acceptOrder(orderId: string, pickupCode: string) {
   try {
      const token = await getUserTokens();
      const locale = await getLocale();

      if (!token?.decodedToken?.uid) {
         return { success: false, error: "Unauthorized" };
      }

      // Verify user is approved driver
      const user = await prisma.user.findUnique({
         where: { authId: token.decodedToken.uid },
      });

      if (!user || user.driverStatus !== "APPROVED") {
         return { success: false, error: "You must be an approved driver" };
      }

      // Get order and verify pickup code
      const order = await prisma.order.findUnique({
         where: { id: orderId },
      });

      if (!order) {
         return { success: false, error: "Order not found" };
      }

      if (order.status !== "READY_TO_DELIVER") {
         return { success: false, error: "Order is not ready for pickup" };
      }

      if (order.pickupCode !== pickupCode.toUpperCase()) {
         return { success: false, error: "Invalid pickup code" };
      }

      // Update order status
      const updatedOrder = await prisma.order.update({
         where: { id: orderId },
         data: {
            status: "ACCEPTED_BY_DRIVER",
            // In future, add driverId field: driverId: user.id
         },
         include: {
            items: {
               include: {
                  product: true,
               },
            },
            merchant: true,
            user: true,
         },
      });

      try {
         await notifyClientOrderStatusChange({
            authId: updatedOrder.user.authId,
            orderId: updatedOrder.id,
            newStatus: OrderStatus.ACCEPTED_BY_DRIVER,
            locale,
         });
      } catch (error) {
         console.error({ message: '❌ Failed to notify client:', error });
      }

      return { success: true, data: updatedOrder };
   } catch (error) {
      console.error({ message: "Error accepting order:", error });
      return {
         success: false,
         error: error instanceof Error ? error.message : "Failed to accept order",
      };
   }
}

export async function updateOrderToOnTheWay(orderId: string) {
   try {
      const token = await getUserTokens();


      if (!token?.decodedToken?.uid) {
         return { success: false, error: "Unauthorized" };
      }

      const order = await prisma.order.findUnique({
         where: { id: orderId },
      });

      if (!order) {
         return { success: false, error: "Order not found" };
      }

      if (order.status !== "ACCEPTED_BY_DRIVER") {
         return { success: false, error: "Order must be accepted first" };
      }

      const updatedOrder = await prisma.order.update({
         where: { id: orderId },
         data: { status: "ON_THE_WAY" },
      });

      return { success: true, data: updatedOrder };
   } catch (error) {
      console.error({ message: "Error updating order status:", error });
      return {
         success: false,
         error: error instanceof Error ? error.message : "Failed to update order",
      };
   }
}

export async function completeDelivery(orderId: string, deliveryCode: string) {
   try {
      const token = await getUserTokens();

      if (!token?.decodedToken?.uid) {
         return { success: false, error: "Unauthorized" };
      }

      // Verify user is approved driver
      const user = await prisma.user.findUnique({
         where: { authId: token.decodedToken.uid },
      });

      if (!user || user.driverStatus !== "APPROVED") {
         return { success: false, error: "You must be an approved driver" };
      }

      // Get order and verify delivery code
      const order = await prisma.order.findUnique({
         where: { id: orderId },
         include: {
            payment: true,
         },
      });

      if (!order) {
         return { success: false, error: "Order not found" };
      }

      if (order.status !== "ON_THE_WAY" && order.status !== "ACCEPTED_BY_DRIVER") {
         return { success: false, error: "Order is not ready for delivery completion" };
      }

      if (order.deliveryCode !== deliveryCode.toUpperCase()) {
         return { success: false, error: "Invalid delivery code" };
      }

      // Update order status to completed
      const updatedOrder = await prisma.order.update({
         where: { id: orderId },
         data: { status: "COMPLETED" },
      });

      // Update payment status if exists
      if (order.payment) {
         await prisma.payment.update({
            where: { id: order.payment.id },
            data: { status: "COMPLETED" },
         });
      }

      // Calculate driver earnings (80% of delivery fee)
      const earnings = order.orderPrices.deliveryFee * 0.8;

      // In future, update driver wallet/earnings here

      return { success: true, data: updatedOrder, earnings };
   } catch (error) {
      console.error({ message: "Error completing delivery:", error });
      return {
         success: false,
         error: error instanceof Error ? error.message : "Failed to complete delivery",
      };
   }
}