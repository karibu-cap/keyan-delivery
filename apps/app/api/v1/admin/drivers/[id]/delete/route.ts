import { deleteDriver } from "@/lib/actions/server/admin/drivers";
import { NextResponse } from "next/server";


export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const driverId = await params;
    if (!driverId.id) {
        return NextResponse.json({ error: "Driver ID is required" }, { status: 400 });
    }
    try {
        const result = await deleteDriver(driverId.id);
        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete driver " + error }, { status: 500 });
    }
}