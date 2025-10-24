import { getMessageTemplates } from "@/lib/actions/server/admin/messaging";
import { NextResponse } from "next/server";


export const GET = async () => {
    try {
        const templates = await getMessageTemplates();
        return NextResponse.json(templates);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to get templates " + error }, { status: 500 });
    }
}