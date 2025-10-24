import { bulkProducts } from "@/lib/actions/server/admin/products";
import { NextResponse } from "next/server";


export const PUT = async (req: Request) => {
    const body = await req.json();
    const { productIds, action } = body;
    if (!productIds || !Array.isArray(productIds) || !action || !['approve', 'reject'].includes(action)) {
        return NextResponse.json(
            { error: "Invalid product IDs or action" },
            { status: 400 }
        );
    }
    const result = await bulkProducts(productIds, action);
    return NextResponse.json(result);
};