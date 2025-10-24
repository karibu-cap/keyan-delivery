import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/v1/orders/[orderId]/tracking
 * Get order tracking information including driver's current location
 * Accessible by both driver and customer
 */
export async function POST(
    request: NextRequest,
) {
    try {

        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }



        const body = await request.json();
        const { orderId } = body;

        // Fetch order with tracking information
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                status: true,
                driverCurrentLocation: true,
                driverLocationUpdatedAt: true,
                userId: true,
                driverId: true,
                deliveryInfo: true,
                merchant: {
                    select: {
                        businessName: true,
                        address: true,
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order not found" },
                { status: 404 }
            );
        }

        // Verify user has access to this order (either customer or driver)
        // if (order.userId !== user.id && order.driverId !== user.id) {
        //     return NextResponse.json(
        //         { success: false, message: "You don't have access to this order" },
        //         { status: 403 }
        //     );
        // }

        // Return tracking data
        return NextResponse.json({
            success: true,
            data: {
                orderId: order.id,
                status: order.status,
                driverLocation: order.driverCurrentLocation,
                driverLocationUpdatedAt: order.driverLocationUpdatedAt,
                deliveryLocation: {
                    latitude: order.deliveryInfo.location.lat,
                    longitude: order.deliveryInfo.location.lng,
                    address: order.deliveryInfo.landmark?.name,
                },
                merchantLocation: order.merchant.address.latitude && order.merchant.address.longitude
                    ? {
                        latitude: order.merchant.address.latitude,
                        longitude: order.merchant.address.longitude,
                        name: order.merchant.businessName,
                    }
                    : null,
            },
        });
    } catch (error) {
        console.error("Error fetching order tracking:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch tracking data" },
            { status: 500 }
        );
    }
}
