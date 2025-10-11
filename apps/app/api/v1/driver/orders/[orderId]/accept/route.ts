import { getUserTokens } from "@/lib/firebase-client/firebase-utils";
import { prisma } from "@/lib/prisma";
import { DriverStatus, OrderStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
   request: NextRequest,
   { params }: { params: { orderId: string } }
) {
   try {
      const token = await getUserTokens();

      if (!token?.decodedToken?.uid) {
         return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
         );
      }

      const { orderId } = params;
      const body = await request.json();
      const { pickupCode } = body;

      if (!pickupCode) {
         return NextResponse.json(
            { success: false, error: "Pickup code is required" },
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

      // Get order and verify pickup code
      const order = await prisma.order.findUnique({
         where: { id: orderId },
      });

      if (!order) {
         return NextResponse.json(
            { success: false, error: "Order not found" },
            { status: 404 }
         );
      }

      if (order.status !== OrderStatus.READY_TO_DELIVER) {
         return NextResponse.json(
            { success: false, error: "Order is not ready for pickup" },
            { status: 400 }
         );
      }

      if (order.pickupCode !== pickupCode.toUpperCase()) {
         return NextResponse.json(
            { success: false, error: "Invalid pickup code" },
            { status: 400 }
         );
      }

      // Update order status
      const updatedOrder = await prisma.order.update({
         where: { id: orderId },
         data: {
            status: OrderStatus.ACCEPTED_BY_DRIVER,
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

      return NextResponse.json({
         success: true,
         data: updatedOrder,
         message: "Order accepted successfully",
      });
   } catch (error) {
      console.error("Error accepting order:", error);
      return NextResponse.json(
         {
            success: false,
            error: error instanceof Error ? error.message : "Failed to accept order",
         },
         { status: 500 }
      );
   }
}