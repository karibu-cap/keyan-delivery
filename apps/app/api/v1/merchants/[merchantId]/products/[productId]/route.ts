import { getUserTokens } from '@/lib/firebase-client/firebase-utils';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ merchantId: string; productId: string }> }
) {
    try {
        const params = await props.params
        const token = await getUserTokens();

        if (!token?.decodedToken?.uid) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Find user by Firebase UID
        const user = await prisma.user.findUnique({
            where: {
                authId: token.decodedToken.uid,
            },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        const productId = params.productId;

        // Find the product and check if it belongs to the merchant
        const product = await prisma.product.findFirst({
            where: {
                id: productId,
                merchantId: params.merchantId,
            },
            include: {
                OrderItem: true,
            },
        });

        if (!product) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        if (product.OrderItem.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Cannot delete product with existing orders' },
                { status: 400 }
            );
        }

        // Delete related data first
        await prisma.categoriesOnProducts.deleteMany({
            where: { productId },
        });

        await prisma.productPromotion.deleteMany({
            where: { productId },
        });

        await prisma.cartItem.deleteMany({
            where: { productId },
        });

        // Delete the product
        await prisma.product.delete({
            where: { id: productId },
        });

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}