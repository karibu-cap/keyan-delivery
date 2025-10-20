import { getUserTokens } from "@/lib/firebase-client/server-firebase-utils";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const token = await getUserTokens();

        if (!token?.decodedToken?.uid) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { walletId } = body;

        // Get order details
        const transactions = await prisma.transaction.findMany({
            where: {
                walletId: walletId
             },
        });
        console.log('transactions \n\n\n ', transactions)

        if (transactions.length === 0) {
            return NextResponse.json(
                { success: false, error: "No transactions found for this wallet" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: transactions,
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to fetch transactions",
            },
            { status: 500 }
        );
    }
}