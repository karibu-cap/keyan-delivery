import { getUserTokens } from "@/lib/firebase-client/firebase-utils";
import { prisma } from "@/lib/prisma";
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

      if (!user || user.driverStatus !== "APPROVED") {
         return NextResponse.json(
            { success: false, error: "You must be an approved driver to view orders" },
            { status: 403 }
         );
      }

      // Get orders ready for delivery and driver's active orders
      const orders = await prisma.order.findMany({
         where: {
            OR: [
               { status: "READY_TO_DELIVER" },
               {
                  status: { in: ["ACCEPTED_BY_DRIVER", "ON_THE_WAY"] },
                  // In future, filter by driverId when that field is added
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