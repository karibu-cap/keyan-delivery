import { clearCartAction } from "@/lib/actions/server/cart-actions";
import { verifySession } from "@/lib/auth-server";
import { NextResponse } from "next/server";


export async function DELETE() {
    try {
        const token = await verifySession();

        const response = await clearCartAction(token?.user.id);

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching cart:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch cart' },
            { status: 500 }
        );
    }
}