import { getUserTokens } from "@/lib/firebase-client/firebase-utils";
import { prisma } from "@/lib/prisma";
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

      // Verify user is an approved driver
      const user = await prisma.user.findUnique({
         where: { authId: token.decodedToken.uid },
      });

      if (!user || user.driverStatus !== "APPROVED") {
         return NextResponse.json(
            { success: false, error: "You must be an approved driver" },
            { status: 403 }
         );
      }

      // Get order
      const order = await prisma.order.findUnique({
         where: { id: orderId },
      });

      if (!order) {
         return NextResponse.json(
            { success: false, error: "Order not found" },
            { status: 404 }
         );
      }

      if (order.status !== "ACCEPTED_BY_DRIVER") {
         return NextResponse.json(
            { success: false, error: "Order must be accepted first" },
            { status: 400 }
         );
      }

      // Update order status to ON_THE_WAY
      const updatedOrder = await prisma.order.update({
         where: { id: orderId },
         data: { status: "ON_THE_WAY" },
      });

      return NextResponse.json({
         success: true,
         data: updatedOrder,
         message: "Order status updated to on the way",
      });
   } catch (error) {
      console.error("Error updating order status:", error);
      return NextResponse.json(
         {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update order",
         },
         { status: 500 }
      );
   }
}