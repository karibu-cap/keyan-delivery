"use server";

import { prisma } from '@/lib/prisma';
import type { Cart, CartItem } from '@/types/cart';
import { randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Function to generate a unique cart key (24-character hex string like "68ecc732afe209734924c514")
function generateCartKey(): string {
    return randomBytes(12).toString('hex');
}

// Cart item schema for validation
const CartItemSchema = z.object({
    productId: z.string(),
    quantity: z.number().min(1).max(99),
    price: z.number().positive(),
});

// Types


// Helper functions for cart persistence
function getCartCookieName(): string {
    return 'user-cart';
}

async function getOrCreateCartId(): Promise<string> {
    const cookieStore = await cookies();
    let cartId = cookieStore.get(getCartCookieName())?.value;
    if (!cartId) {
        // Create a new cart ID (you might want to use a more sophisticated ID generation)
        cartId = generateCartKey();
        cookieStore.set(getCartCookieName(), cartId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });
    }

    return cartId;
}

// Server Actions for cart management
export async function addToCartAction(
    productId: string,
    quantity: number,
    price: number,
): Promise<{ success: boolean; error?: string }> {
    try {
        const cartId = await getOrCreateCartId();


        const validatedData = CartItemSchema.parse({
            productId: productId,
            quantity: quantity,
            price: price,
        });

        // Check if product exists and is in stock
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return { success: false, error: 'Product not found' };
        }

        if (!product.visibility || product.status !== 'VERIFIED') {
            return { success: false, error: 'Product not available' };
        }

        // For demo purposes, we'll use a guest cart system with cartId
        // In a real app, you'd use authenticated userId
        const effectiveuserId = cartId;

        // Check if item already exists in cart
        const existingItem = await prisma.cartItem.findUnique({
            where: {
                userId_productId: {
                    userId: effectiveuserId,
                    productId: validatedData.productId,
                },
            },
        });

        if (existingItem) {
            // Update existing item
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: {
                    quantity: existingItem.quantity + validatedData.quantity,
                    priceAtAdd: validatedData.price, // Update price in case it changed
                },
            });
        } else {

            // Add new item
            await prisma.cartItem.create({
                data: {
                    userId: effectiveuserId,
                    productId: validatedData.productId,
                    quantity: validatedData.quantity,
                    priceAtAdd: validatedData.price,
                },
            });
        }

        // Revalidate relevant paths
        revalidatePath('/cart');
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error({ message: 'Error adding to cart:', error });
        return { success: false, error: 'Failed to add item to cart' };
    }
}

export async function updateCartItemAction(
    productId: string,
    quantity: number,
): Promise<{ success: boolean; error?: string }> {
    try {
        const cartId = await getOrCreateCartId();

        if (quantity <= 0) {
            return removeFromCartAction(productId);
        }

        // Validate input
        const validatedData = CartItemSchema.pick({ productId: true, quantity: true }).parse({
            productId,
            quantity,
        });

        // Check if product exists and is in stock
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return { success: false, error: 'Product not found' };
        }

        // For demo purposes, we'll use a guest cart system with cartId
        const effectiveuserId = cartId;

        // Find and update the cart item
        const existingItem = await prisma.cartItem.findUnique({
            where: {
                userId_productId: {
                    userId: effectiveuserId,
                    productId: validatedData.productId,
                },
            },
        });

        if (!existingItem) {
            return { success: false, error: 'Item not in cart' };
        }

        await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: {
                quantity: validatedData.quantity,
                priceAtAdd: product.price, // Update price in case it changed
            },
        });

        revalidatePath('/cart');
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error({ message: 'Error updating cart item:', error });
        return { success: false, error: 'Failed to update cart item' };
    }
}

export async function removeFromCartAction(
    productId: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const cartId = await getOrCreateCartId();

        // For demo purposes, we'll use a guest cart system with cartId
        const effectiveuserId = cartId;

        // Find the cart item
        const existingItem = await prisma.cartItem.findUnique({
            where: {
                userId_productId: {
                    userId: effectiveuserId,
                    productId: productId,
                },
            },
        });

        if (!existingItem) {
            return { success: false, error: 'Item not in cart' };
        }

        await prisma.cartItem.delete({
            where: { id: existingItem.id },
        });

        revalidatePath('/cart');
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error({ message: 'Error removing from cart:', error });
        return { success: false, error: 'Failed to remove item from cart' };
    }
}

export async function getCartAction(): Promise<{ success: boolean; data?: Cart; error?: string }> {
    try {
        const cartId = await getOrCreateCartId();

        // For demo purposes, we'll use a guest cart system with cartId
        const effectiveuserId = cartId;

        const cartItems = await prisma.cartItem.findMany({
            where: { userId: effectiveuserId },
            include: {
                product: {
                    include: {
                        images: true,
                        categories: {
                            include: {
                                category: true,
                            },
                        },
                        merchant: true,
                        _count: true
                    },
                },

            },
        });

        if (!cartItems.length) {
            return { success: true, data: { items: [], total: 0, itemCount: 0 } };
        }

        const items: CartItem[] = cartItems.map((item) => ({
            product: item.product,
            quantity: item.quantity,
            price: item.priceAtAdd,
        }));

        const total = cartItems.reduce(
            (sum: number, item) => sum + item.priceAtAdd * item.quantity,
            0
        );

        const itemCount = cartItems.reduce(
            (sum: number, item) => sum + item.quantity,
            0
        );

        return {
            success: true,
            data: {
                items,
                total,
                itemCount,
            },
        };
    } catch (error) {
        console.error({ message: 'Error fetching cart:', error });
        return { success: false, error: 'Failed to fetch cart' };
    }
}

export async function clearCartAction(): Promise<{ success: boolean; error?: string }> {
    try {
        const cartId = await getOrCreateCartId();

        // For demo purposes, we'll use a guest cart system with cartId
        const effectiveuserId = cartId;

        await prisma.cartItem.deleteMany({
            where: { userId: effectiveuserId },
        });

        revalidatePath('/cart');
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error({ message: 'Error clearing cart:', error });
        return { success: false, error: 'Failed to clear cart' };
    }
}
