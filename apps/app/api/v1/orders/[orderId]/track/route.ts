import { getUserTokens } from "@/lib/firebase-client/firebase-utils"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ orderId: string }> }
) {
    try {
        const params = await props.params
        // Authenticate user
        const token = await getUserTokens()

        if (!token?.decodedToken?.uid) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { authId: token.decodedToken.uid },
            select: { id: true },
        })

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        // Fetch order with tracking information
        const order = await prisma.order.findFirst({
            where: {
                id: params.orderId,
                userId: user.id,
            },
            select: {
                id: true,
                status: true,
                deliveryInfo: true,
                createdAt: true,
                updatedAt: true,
                merchant: {
                    select: {
                        businessName: true,
                        address: true,
                    },
                },
                // If you have a driver relation, include it here
                // driver: {
                //   select: {
                //     name: true,
                //     phone: true,
                //     vehicleInfo: true,
                //     currentLocation: true,
                //   },
                // },
            },
        })

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            )
        }

        // For now, we'll return mock driver data if order is in transit
        // Replace this with actual driver data from your database
        const driverData = ["ACCEPTED_BY_DRIVER", "ON_THE_WAY", "READY_TO_DELIVER"].includes(order.status)
            ? {
                name: "Driver Name",
                phone: "+237123456789",
                vehicleInfo: "Toyota Corolla - ABC 123",
                currentLocation: order.deliveryInfo.location
                    ? {
                        coordinates: [
                            order.deliveryInfo.location.coordinates[0] + 0.001,
                            order.deliveryInfo.location.coordinates[1] + 0.001,
                        ] as [number, number],
                    }
                    : undefined,
            }
            : undefined

        return NextResponse.json({
            id: order.id,
            status: order.status,
            deliveryInfo: order.deliveryInfo,
            merchant: order.merchant,
            driver: driverData,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        })
    } catch (error) {
        console.error("Error fetching order tracking:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// Configure runtime and caching
export const runtime = "nodejs"
export const dynamic = "force-dynamic"