import { verifySession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { calculateTotalDistance } from "@/lib/utils/distance";
import { DriverStatus, OrderStatus, PaymentStatus, TransactionStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

interface StatusUpdateRequest {
    action: OrderStatus;
    pickupCode?: string;
    deliveryCode?: string;
}

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ orderId: string }> }
) {
    try {
        const params = await props.params;
        const token = await verifySession();

        if (!token?.user.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { orderId } = params;
        const body: StatusUpdateRequest = await request.json();
        const { action, pickupCode, deliveryCode } = body;

        if (!action) {
            return NextResponse.json(
                { success: false, error: "Action is required" },
                { status: 400 }
            );
        }

        // Verify user is an approved driver
        const user = await prisma.user.findUnique({
            where: { id: token.user.id },
        });

        if (!user || user.driverStatus !== DriverStatus.APPROVED) {
            return NextResponse.json(
                { success: false, error: "You must be an approved driver" },
                { status: 403 }
            );
        }

        // Get order
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                payment: true,
                merchant: true
            },
        });

        if (!order) {
            return NextResponse.json(
                { success: false, error: "Order not found" },
                { status: 404 }
            );
        }

        let newStatus: OrderStatus;
        let responseMessage: string;
        let earnings: number | undefined;
        let driverTotalDistanceInKilometers: number = 0;

        // Handle different actions
        switch (action) {
            case OrderStatus.ACCEPTED_BY_DRIVER:
                if (!pickupCode) {
                    return NextResponse.json(
                        { success: false, error: "Pickup code is required for accepting order" },
                        { status: 400 }
                    );
                }

                if (order.status !== OrderStatus.READY_TO_DELIVER) {
                    return NextResponse.json(
                        { success: false, error: "Order is not ready for pickup" },
                        { status: 400 }
                    );
                }

                if (order.pickupCode?.toLocaleLowerCase() !== pickupCode.toLocaleLowerCase()) {
                    return NextResponse.json(
                        { success: false, error: "Invalid pickup code" },
                        { status: 400 }
                    );
                }

                newStatus = OrderStatus.ACCEPTED_BY_DRIVER;
                responseMessage = "Order accepted successfully";
                break;

            case OrderStatus.ON_THE_WAY:
                if (order.status !== OrderStatus.ACCEPTED_BY_DRIVER) {
                    return NextResponse.json(
                        { success: false, error: "Order must be accepted first" },
                        { status: 400 }
                    );
                }

                newStatus = OrderStatus.ON_THE_WAY;
                responseMessage = "Order status updated to on the way";

                driverTotalDistanceInKilometers = await calculateTotalDistance({
                    start: {
                        lat: order.driverStartDeliveryLocation?.latitude,
                        lng: order.driverStartDeliveryLocation?.longitude
                    },
                    end: {
                        lat: order.merchant.address.latitude,
                        lng: order.merchant.address.longitude,
                    }
                })

                break;

            case OrderStatus.COMPLETED:
                if (!deliveryCode) {
                    return NextResponse.json(
                        { success: false, error: "Delivery code is required for completing delivery" },
                        { status: 400 }
                    );
                }

                if (order.status !== OrderStatus.ON_THE_WAY && order.status !== OrderStatus.ACCEPTED_BY_DRIVER) {
                    return NextResponse.json(
                        { success: false, error: "Order is not ready for delivery completion" },
                        { status: 400 }
                    );
                }

                if (order.deliveryCode?.toLocaleLowerCase() !== deliveryCode.toLocaleLowerCase()) {
                    return NextResponse.json(
                        { success: false, error: "Invalid delivery code" },
                        { status: 400 }
                    );
                }

                newStatus = OrderStatus.COMPLETED;
                responseMessage = "Delivery completed successfully";

                // Update payment status if exists
                if (order.payment) {
                    await prisma.payment.update({
                        where: { id: order.payment.id },
                        data: { status: PaymentStatus.COMPLETED },
                    });
                }

                // Calculate driver earnings (80% of delivery fee)
                earnings = order.orderPrices.deliveryFee * 0.8;

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

                driverTotalDistanceInKilometers = await calculateTotalDistance({
                    start: {
                        lat: order.driverStartDeliveryLocation?.latitude,
                        lng: order.driverStartDeliveryLocation?.longitude
                    },
                    end: {
                        lat: order.deliveryInfo.location.lat,
                        lng: order.deliveryInfo.location.lat,
                    }
                }) + (order.driverTotalDistanceInKilometers ?? 0);

                break;

            default:
                return NextResponse.json(
                    { success: false, error: "Invalid action" },
                    { status: 400 }
                );
        }
        const driverStatusHistories = Array.isArray(order.driverStatusHistories)
            ? order.driverStatusHistories
            : [];
        order?.driverStatusHistories;

        driverStatusHistories.push({ status: newStatus, timestamp: new Date().toISOString(), })

        // Update order status
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus, driverId: user.id, driverStatusHistories, driverTotalDistanceInKilometers },
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
            message: responseMessage,
            earnings,
        });
    } catch (error) {
        console.error("Error updating order status:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to update order status",
            },
            { status: 500 }
        );
    }
}