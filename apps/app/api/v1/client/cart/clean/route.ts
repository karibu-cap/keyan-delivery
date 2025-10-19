import { clearCartAction } from "@/lib/actions/server/cart-actions";
import { getUserTokens } from "@/lib/firebase-client/server-firebase-utils";
import { NextResponse } from "next/server";


export async function DELETE() {
    try {
        const token = await getUserTokens();

        const response = await clearCartAction(token?.decodedToken?.uid);

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching cart:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch cart' },
            { status: 500 }
        );
    }
}