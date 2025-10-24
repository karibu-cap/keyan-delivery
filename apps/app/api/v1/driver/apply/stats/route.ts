// app/api/v1/driver/apply/stats/route.ts
// API endpoint to fetch driver application stats (active drivers, drivers in review, etc.)

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DriverStatus } from '@prisma/client';

export async function GET() {
    try {
        // Count active drivers (APPROVED status)
        const activeDriversCount = await prisma.user.count({
            where: {
                roles: {
                    has: 'driver',
                },
                driverStatus: DriverStatus.APPROVED,
            },
        });

        // Count drivers in review (PENDING status)
        const driversInReviewCount = await prisma.user.count({
            where: {
                roles: {
                    has: 'driver',
                },
                driverStatus: DriverStatus.PENDING,
            },
        });

        // Calculate average review time (mock for now, could be calculated from actual data)
        // This would require tracking application submission and approval dates
        const avgReviewTimeHours = 36; // 24-48h average

        // Required documents count (static)
        const requiredDocuments = 2; // CNI + Driver License

        return NextResponse.json({
            requiredDocuments,
            avgReviewTimeHours,
            activeDriversCount,
            driversInReviewCount,
        });
    } catch (error) {
        console.error('Error fetching apply stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
