// app/api/v1/driver/profile/documents/route.ts
// API endpoint to fetch driver documents (CNI and driver license)

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserTokens } from '@/lib/firebase-client/server-firebase-utils';

export async function GET() {
    try {
        const tokens = await getUserTokens();
        const authId = tokens?.decodedToken.uid;

        if (!authId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get driver documents from database
        const user = await prisma.user.findUnique({
            where: { authId },
            select: {
                cni: true,
                driverDocument: true,
                driverStatus: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            cni: user.cni,
            driverDocument: user.driverDocument,
        });
    } catch (error) {
        console.error('Error fetching driver documents:', error);
        return NextResponse.json(
            { error: 'Failed to fetch documents' },
            { status: 500 }
        );
    }
}
