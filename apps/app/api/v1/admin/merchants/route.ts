import { getAllMerchants } from "@/lib/actions/server/admin/merchants";
import { NextResponse } from "next/server";


export const GET = async () => {
    try {
        const merchants = await getAllMerchants();
        return NextResponse.json(merchants);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to get merchants " + error }, { status: 500 });
    }
}