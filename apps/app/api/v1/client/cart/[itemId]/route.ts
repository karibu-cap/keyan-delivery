import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/cart/[itemId] - Update cart item quantity
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const body = await request.json();
    const { quantity, selectedWeight, unit } = body;

    if (quantity !== undefined && quantity <= 0) {
      // If quantity is 0 or negative, delete the item
      await prisma.cartItem.delete({
        where: { id: itemId }
      });
      return NextResponse.json({
        success: true,
        message: 'Item removed from cart'
      });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity: quantity || undefined,
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
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart/[itemId] - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    await prisma.cartItem.delete({
      where: { id: itemId }
    });

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove cart item' },
      { status: 500 }
    );
  }
}