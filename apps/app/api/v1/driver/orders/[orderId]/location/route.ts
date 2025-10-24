import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/v1/driver/orders/[orderId]/location
 * Update driver's current location for an order
 * Used for real-time tracking
 */
export async function POST(
    request: NextRequest
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
            select: { id: true, roles: true },
        });

        if (!user || !user.roles.includes(UserRole.driver)) {
            return NextResponse.json(
                { success: false, message: "Only drivers can update location" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { latitude, longitude, orderId } = body;

        // Validate coordinates
        if (
            typeof latitude !== "number" ||
            typeof longitude !== "number" ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid coordinates" },
                { status: 400 }
            );
        }

        // Verify order belongs to this driver
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: {
                driverId: true,
                status: true,
                driverStartDeliveryLocation: true,
            },
        });

        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order not found" },
                { status: 404 }
            );
        }

        if (order.driverId !== user.id) {
            return NextResponse.json(
                { success: false, message: "This order is not assigned to you" },
                { status: 403 }
            );
        }

        // Prepare update data
        const updateData: any = {
            driverCurrentLocation: {
                latitude,
                longitude,
                timestamp: new Date().toISOString(),
            },
            driverLocationUpdatedAt: new Date(),
        };

        // Only update driverStartDeliveryLocation if it doesn't exist
        if (!order.driverStartDeliveryLocation) {
            updateData.driverStartDeliveryLocation = {
                latitude,
                longitude,
                timestamp: new Date().toISOString(),
            };
        }

        // Update driver location
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: updateData,
            select: {
                id: true,
                driverCurrentLocation: true,
                driverStartDeliveryLocation: true,
                driverLocationUpdatedAt: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Location updated successfully",
            data: updatedOrder,
        });
    } catch (error) {
        console.error("Error updating driver location:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update location" },
            { status: 500 }
        );
    }
}
