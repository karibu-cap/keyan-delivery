import { getUserTokens } from "@/lib/firebase-client/server-firebase-utils";
import { prisma } from "@/lib/prisma";
import { DriverStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ orderId: string }> }
) {
    try {
        const params = await props.params;
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

        if (!user || user.driverStatus !== DriverStatus.APPROVED) {
            return NextResponse.json(
                { success: false, error: "You must be an approved driver" },
                { status: 403 }
            );
        }

        // Get order details
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                merchant: true,
                payment: true,
            },
        });

        if (!order) {
            return NextResponse.json(
                { success: false, error: "Order not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error("Error fetching order details:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to fetch order details",
            },
            { status: 500 }
        );
    }
}