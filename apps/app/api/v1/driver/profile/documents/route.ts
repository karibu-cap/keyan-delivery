// app/api/v1/driver/profile/documents/route.ts
// API endpoint to fetch driver documents (CNI and driver license)

import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await getSession();
        const id = session?.user.id;

        if (!id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get driver documents from database
        const user = await prisma.user.findUnique({
            where: { id: id },
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
            driverStatus: user.driverStatus,
        });
    } catch (error) {
        console.error('Error fetching driver documents:', error);
        return NextResponse.json(
            { error: 'Failed to fetch documents' },
            { status: 500 }
        );
    }
}
