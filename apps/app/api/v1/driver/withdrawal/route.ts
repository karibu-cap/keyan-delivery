// File: /app/api/v1/driver/withdrawal/route.ts
// API endpoint for driver withdrawal requests to MTN Kenya

import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/v1/driver/withdrawal
 * Request withdrawal to MTN Mobile Money
 */
export async function POST(request: NextRequest) {
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
            select: {
                id: true,
                roles: true,
                wallet: {
                    select: {
                        id: true,
                        balance: true,
                    }
                }
            },
        });

        if (!user || !user.roles.includes(UserRole.driver)) {
            return NextResponse.json(
                { success: false, message: "Only drivers can request withdrawals" },
                { status: 403 }
            );
        }

        if (!user.wallet) {
            return NextResponse.json(
                { success: false, message: "Wallet not found" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { amount, mtnNumber } = body;

        // Validate amount
        if (!amount || isNaN(amount) || amount <= 0) {
            return NextResponse.json(
                { success: false, message: "Invalid withdrawal amount" },
                { status: 400 }
            );
        }

        // Check sufficient balance
        if (amount > user.wallet.balance) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Insufficient balance. Available: KES ${user.wallet.balance.toFixed(2)}`
                },
                { status: 400 }
            );
        }

        // Validate MTN Kenya phone number
        if (!mtnNumber || typeof mtnNumber !== 'string') {
            return NextResponse.json(
                { success: false, message: "MTN Mobile Money number is required" },
                { status: 400 }
            );
        }

        const phoneRegex = /^(\+254|254|0)[17]\d{8}$/;
        const cleanedNumber = mtnNumber.replace(/\s/g, "");

        if (!phoneRegex.test(cleanedNumber)) {
            return NextResponse.json(
                { success: false, message: "Invalid Kenyan MTN number format" },
                { status: 400 }
            );
        }

        // Normalize phone number to international format
        let normalizedNumber = cleanedNumber;
        if (normalizedNumber.startsWith('0')) {
            normalizedNumber = '+254' + normalizedNumber.substring(1);
        } else if (normalizedNumber.startsWith('254')) {
            normalizedNumber = '+' + normalizedNumber;
        }

        // Create withdrawal transaction
        const transaction = await prisma.transaction.create({
            data: {
                walletId: user.wallet.id,
                amount,
                type: 'debit',
                status: 'PENDING',
                description: `Withdrawal to MTN ${normalizedNumber} - Requested at ${new Date().toISOString()}`,
            },
        });

        // Update wallet balance (deduct amount)
        await prisma.wallet.update({
            where: { id: user.wallet.id },
            data: {
                balance: {
                    decrement: amount,
                },
            },
        });

        // TODO: Integrate with MTN Mobile Money API
        // For now, we just create the transaction as PENDING
        // In production, you would:
        // 1. Call MTN Mobile Money API to initiate payment
        // 2. Update transaction status based on API response
        // 3. Handle webhooks for payment confirmation

        return NextResponse.json({
            success: true,
            message: "Withdrawal request submitted successfully",
            data: {
                transactionId: transaction.id,
                amount,
                phoneNumber: normalizedNumber,
                status: transaction.status,
            },
        });

    } catch (error) {
        console.error("Error processing withdrawal:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Failed to process withdrawal",
            },
            { status: 500 }
        );
    }
}
