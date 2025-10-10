import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/cart - Fetch user's cart
export async function GET() {
  try {
    // For demo purposes, using a fixed user ID
    // In production, get from session
    const userId = 'demo-user-id';

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: true,
            merchant: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: cartItems
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity, selectedWeight, unit } = body;

    if (!productId || !quantity) {
      return NextResponse.json(
        { success: false, error: 'Product ID and quantity are required' },
        { status: 400 }
      );
    }

    // For demo purposes, using a fixed user ID
    const userId = 'demo-user-id';

    // Get product to verify it exists and get current price
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (existingItem) {
      // Update quantity if item exists
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          selectedWeight,
          unit
        },
        include: {
          product: {
            include: {
              images: true,
              merchant: true
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        data: updatedItem,
        message: 'Cart item updated'
      });
    } else {
      // Create new cart item
      const cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity,
          selectedWeight,
          unit,
          priceAtAdd: product.price
        },
        include: {
          product: {
            include: {
              images: true,
              merchant: true
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        data: cartItem,
        message: 'Item added to cart'
      });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}