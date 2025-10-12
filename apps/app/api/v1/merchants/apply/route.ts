import { getUserTokens } from '@/lib/firebase-client/firebase-utils';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/utils';
import { MerchantType, UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const token = await getUserTokens();

        if (!token?.decodedToken?.uid) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Find user by Firebase UID
        const user = await prisma.user.findUnique({
            where: {
                authId: token.decodedToken.uid,
            },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        const body = await request.json();
        const {
            businessName,
            phone,
            merchantType,
            latitude,
            longitude,
            logoUrl,
            bannerUrl,
        } = body;

        // Validate required fields
        if (!businessName || !phone || !merchantType || !latitude || !longitude || !logoUrl) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if user already has a pending or approved merchant application
        const existingMerchant = await prisma.userMerchantManager.findFirst({
            where: {
                userId: user.id,
            },
            include: {
                merchant: true,
            },
        });

        if (existingMerchant) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'You already have a merchant account or pending application'
                },
                { status: 400 }
            );
        }

        // Create merchant with pending status
        const merchant = await prisma.merchant.create({
            data: {
                businessName,
                slug: generateSlug(businessName),
                phone,
                merchantType: merchantType as MerchantType,
                logoUrl,
                bannerUrl,
                isVerified: false, // Pending approval
                address: {
                    latitude,
                    longitude,
                },
                managers: {
                    create: {
                        userId: user.id,
                    },
                },
            },
        });

        // Update user role to include merchant
        const currentRoles = user.roles || [UserRole.customer];
        if (!currentRoles.includes(UserRole.merchant)) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    roles: [...currentRoles, UserRole.merchant],
                },
            });
        }

        // TODO: Send confirmation email
        // TODO: Notify admin for approval

        return NextResponse.json({
            success: true,
            data: merchant,
            message: 'Merchant application submitted successfully. Pending approval.',
        });
    } catch (error) {
        console.error('Error creating merchant application:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to submit merchant application' },
            { status: 500 }
        );
    }
}