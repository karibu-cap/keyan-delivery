import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const zones = await prisma.deliveryZone.findMany({
            where: { status: 'ACTIVE' },
            select: {
                id: true,
                name: true,
                code: true,
                deliveryFee: true,
                estimatedDeliveryMinutes: true,
                geometry: true,
                color: true,
                description: true,
                landmarks: true,
            },
            orderBy: { priority: 'desc' }
        });

        return NextResponse.json({
            success: true,
            data: zones
        });
    } catch (error) {
        console.error('Error fetching delivery zones:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch delivery zones' },
            { status: 500 }
        );
    }
}