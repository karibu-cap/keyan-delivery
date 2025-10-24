import { deleteProduct, updateProduct } from "@/lib/actions/server/admin/products";
import { NextResponse } from "next/server";

export const PUT = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await req.json();
    const result = await updateProduct(id, body.action);
    return NextResponse.json(result);
}

export const DELETE = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const result = await deleteProduct(id);
    return NextResponse.json(result);
}
