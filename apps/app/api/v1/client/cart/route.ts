import { addToCartAction, getCartAction, removeFromCartAction, updateCartItemAction } from '@/lib/actions/server/cart-actions';
import { verifySession } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/cart - Fetch user's cart
export async function GET() {
  try {
    const session = await verifySession();

    const response = await getCartAction(session?.user.id);
    return NextResponse.json(response);
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
    const { productId, quantity, price, selectedWeight, unit } = body;

    if (!productId || !quantity || !price) {
      return NextResponse.json(
        { success: false, error: 'Product ID, quantity and price are required' },
        { status: 400 }
      );
    }

    const token = await verifySession();

    const userId = token?.user.id;

    // Get product to verify it exists and get current price
    const response = await addToCartAction(productId, quantity, price, userId);

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error },
        { status: 404 }
      );
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}


export async function DELETE(
  request: NextRequest,
) {
  try {
    const token = await verifySession();
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'product ID is required' },
        { status: 400 }
      );
    }

    const response = await removeFromCartAction(productId, token?.user.id);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error removing cart item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove cart item' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
) {
  try {
    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || quantity == undefined) {
      return NextResponse.json(
        { success: false, error: 'product ID and quantity are required' },
        { status: 400 }
      );
    }

    const token = await verifySession();

    const response = await updateCartItemAction(productId, quantity, token?.user.id);


    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}
