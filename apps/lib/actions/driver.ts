"use server";

import { getUserTokens } from "@/lib/firebase-client/firebase-utils";
import { prisma } from "@/lib/prisma";
import { uploadBase64DriverToCloudinary } from "@/lib/utils/server/base_64";
import { DriverStatus, UserRole } from "@prisma/client";

export async function uploadDriverDocuments(cniBase64: string, licenseBase64: string) {
   try {
      const token = await getUserTokens();

      if (!token?.decodedToken?.uid) {
         return { success: false, error: "Unauthorized" };
      }

      if (!cniBase64 || !licenseBase64) {
         return { success: false, error: "CNI and driver document are required" };
      }

      const cniUrl = await uploadBase64DriverToCloudinary(cniBase64);
      const licenseUrl = await uploadBase64DriverToCloudinary(licenseBase64);

      const user = await prisma.user.update({
         where: { authId: token.decodedToken.uid },
         data: {
            cni: cniUrl,
            driverDocument: licenseUrl,
            driverStatus: DriverStatus.PENDING,
            roles: {
               push: UserRole.driver,
            },
         },
      });

      return { success: true, data: user };
   } catch (error) {
      console.error("Error uploading driver documents:", error);
      return {
         success: false,
         error: error instanceof Error ? error.message : "Failed to upload documents",
      };
   }
}

export async function getAvailableOrders() {
   try {
      const token = await getUserTokens();

      if (!token?.decodedToken?.uid) {
         throw new Error("Unauthorized");
      }

      // Check if user is an approved driver
      const user = await prisma.user.findUnique({
         where: { authId: token.decodedToken.uid },
      });

      if (!user || user.driverStatus !== "APPROVED") {
         throw new Error("You must be an approved driver to view orders");
      }

      // Get orders ready for delivery and driver's active orders
      const orders = await prisma.order.findMany({
         where: {
            OR: [
               { status: "READY_TO_DELIVER" },
               {
                  status: { in: ["ACCEPTED_BY_DRIVER", "ON_THE_WAY"] },
                  // In future, add driverId field to filter by current driver
               },
            ],
         },
         include: {
            items: {
               include: {
                  product: {
                     select: {
                        title: true,
                     },
                  },
               },
            },
            merchant: {
               select: {
                  businessName: true,
                  address: true,
               },
            },
         },
         orderBy: {
            createdAt: "desc",
         },
      });

      return orders;
   } catch (error) {
      console.error("Error fetching available orders:", error);
      throw error;
   }
}

export async function acceptOrder(orderId: string, pickupCode: string) {
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
         },
      });

      return { success: true, data: updatedOrder };
   } catch (error) {
      console.error("Error accepting order:", error);
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
      console.error("Error updating order status:", error);
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
      console.error("Error completing delivery:", error);
      return {
         success: false,
         error: error instanceof Error ? error.message : "Failed to complete delivery",
      };
   }
}