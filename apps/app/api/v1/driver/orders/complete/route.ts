import { getUserTokens } from "@/lib/firebase-client/server-firebase-utils";
import { prisma } from "@/lib/prisma";
import { DriverStatus, OrderStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
   try {
      const token = await getUserTokens();

      if (!token?.decodedToken?.uid) {
         return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
         );
      }

      // Verify user is an approved driver
      const user = await prisma.user.findUnique({
         where: { authId: token.decodedToken.uid },
      });

      if (!user || user.driverStatus !== DriverStatus.APPROVED) {
         return NextResponse.json(
            { success: false, error: "You must be an approved driver to view orders" },
            { status: 403 }
         );
      } 

      // Get orders ready for delivery
      const orders = await prisma.order.findMany({
         where: {
            status: OrderStatus.COMPLETED,
            driverId: token.decodedToken.uid,
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
      return NextResponse.json({
         success: true,
         data: orders,
      });
   } catch (error) {
      console.error("Error fetching available orders:", error);
      return NextResponse.json(
         {
            success: false,
            error:
               error instanceof Error
                  ? error.message
                  : "Failed to fetch available orders",
         },
         { status: 500 }
      );
   }
}