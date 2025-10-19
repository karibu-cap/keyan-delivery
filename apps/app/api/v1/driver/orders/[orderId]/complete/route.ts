import { getUserTokens } from "@/lib/firebase-client/server-firebase-utils";
import { prisma } from "@/lib/prisma";
import { DriverStatus, OrderStatus, PaymentStatus, TransactionStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
   request: NextRequest,
   props: { params: Promise<{ orderId: string }> }
) {
   try {
      const params = await props.params
      const token = await getUserTokens();

      if (!token?.decodedToken?.uid) {
         return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
         );
      }

      const { orderId } = params;
      const body = await request.json();
      const { deliveryCode } = body;

      if (!deliveryCode) {
         return NextResponse.json(
            { success: false, error: "Delivery code is required" },
            { status: 400 }
         );
      }

      // Verify user is an approved driver
      const user = await prisma.user.findUnique({
         where: { authId: token.decodedToken.uid },
      });

      if (!user || user.driverStatus !== DriverStatus.APPROVED) {
         return NextResponse.json(
            { success: false, error: "You must be an approved driver" },
            { status: 403 }
         );
      }

      // Get order and verify delivery code
      const order = await prisma.order.findUnique({
         where: { id: orderId },
         include: {
            payment: true,
         },
      });

      if (!order) {
         return NextResponse.json(
            { success: false, error: "Order not found" },
            { status: 404 }
         );
      }

      if (order.status !== OrderStatus.ON_THE_WAY && order.status !== OrderStatus.ACCEPTED_BY_DRIVER) {
         return NextResponse.json(
            {
               success: false,
               error: "Order is not ready for delivery completion",
            },
            { status: 400 }
         );
      }

      if (order.deliveryCode !== deliveryCode.toUpperCase()) {
         return NextResponse.json(
            { success: false, error: "Invalid delivery code" },
            { status: 400 }
         );
      }

      // Update order status to completed
      const updatedOrder = await prisma.order.update({
         where: { id: orderId },
         data: { status: OrderStatus.COMPLETED },
      });

      // Update payment status if exists
      if (order.payment) {
         await prisma.payment.update({
            where: { id: order.payment.id },
            data: { status: PaymentStatus.COMPLETED },
         });
      }

      // Calculate driver earnings (80% of delivery fee)
      const earnings = order.orderPrices.deliveryFee * 0.8;

      // Update driver's wallet
      const wallet = await prisma.wallet.upsert({
         where: { userId: user.id },
         update: {
            balance: {
               increment: earnings,
            },
         },
         create: {
            userId: user.id,
            balance: earnings,
            currency: "USD",
         },
      });

      // Create transaction record
      await prisma.transaction.create({
         data: {
            walletId: wallet.id,
            orderId: order.id,
            amount: earnings,
            type: "credit",
            description: `Delivery earnings for order #${order.id.slice(-6)}`,
            status: TransactionStatus.COMPLETED,
         },
      });

      return NextResponse.json({
         success: true,
         data: updatedOrder,
         earnings,
         message: "Delivery completed successfully",
      });
   } catch (error) {
      console.error("Error completing delivery:", error);
      return NextResponse.json(
         {
            success: false,
            error:
               error instanceof Error ? error.message : "Failed to complete delivery",
         },
         { status: 500 }
      );
   }
}