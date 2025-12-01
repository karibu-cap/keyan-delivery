// app/api/v1/auth/set-user-cookie/route.ts
// API endpoint to set user data in cookie for middleware access

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        // Get session from Better Auth
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                roles: true,
                driverStatus: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Create response with user cookie
        const response = NextResponse.json({ success: true });

        // Set user data cookie
        response.cookies.set('pataupesi-user-data', JSON.stringify({
            id: user.id,
            roles: user.roles,
            driverStatus: user.driverStatus,
        }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days (same as session)
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Error setting user cookie:', error);
        return NextResponse.json(
            { error: 'Failed to set user cookie' },
            { status: 500 }
        );
    }
}
