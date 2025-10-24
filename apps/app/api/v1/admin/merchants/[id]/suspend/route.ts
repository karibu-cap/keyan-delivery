

import { deleteMerchant } from "@/lib/actions/server/admin/merchants";
import { NextResponse } from "next/server";


export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const merchantId = await params;
    if (!merchantId.id) {
        return NextResponse.json({ error: "Merchant ID is required" }, { status: 400 });
    }
    try {
        const result = await deleteMerchant(merchantId.id);
        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete the merchant " + error }, { status: 500 });
    }
}