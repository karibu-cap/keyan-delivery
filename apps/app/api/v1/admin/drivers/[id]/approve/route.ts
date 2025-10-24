import { approveDriver } from "@/lib/actions/server/admin/drivers";
import { NextResponse } from "next/server";


export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const driverId = await params;
    if (!driverId.id) {
        return NextResponse.json({ error: "Driver ID is required" }, { status: 400 });
    }
    try {
        const result = await approveDriver(driverId.id);
        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to approve driver " + error }, { status: 500 });
    }
}