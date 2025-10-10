import { getUserTokens } from '@/lib/firebase-client/firebase-utils';
import { prisma } from '@/lib/prisma';
import { OrderItem } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { items, deliveryInfo, orderPrices, deliveryCode, pickupCode } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Items are required' },
        { status: 400 }
      );
    }

    if (!deliveryInfo || !deliveryInfo.address || !deliveryInfo.deliveryContact) {
      return NextResponse.json(
        { success: false, error: 'Delivery information is required' },
        { status: 400 }
      );
    }

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      if (product.inventory && product.inventory.stockQuantity < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for ${product.title}. Available: ${product.inventory.stockQuantity}`
          },
          { status: 400 }
        );
      }
    }

    // Generate codes if not provided
    const finalDeliveryCode = deliveryCode || Math.random().toString(36).substring(2, 8).toUpperCase();
    const finalPickupCode = pickupCode || Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create order with items
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        merchantId: items[0].merchantId,
        deliveryInfo: {
          address: deliveryInfo.address,
          delivery_latitude: deliveryInfo.delivery_latitude || 0,
          delivery_longitude: deliveryInfo.delivery_longitude || 0,
          deliveryContact: deliveryInfo.deliveryContact,
          additionalNotes: deliveryInfo.additionalNotes || null,
          estimatedDelivery: deliveryInfo.estimatedDelivery
            ? new Date(deliveryInfo.estimatedDelivery)
            : null,
        },
        orderPrices: {
          subtotal: orderPrices.subtotal,
          shipping: orderPrices.shipping,
          discount: orderPrices.discount || 0,
          total: orderPrices.total,
          deliveryFee: orderPrices.deliveryFee,
        },
        deliveryCode: finalDeliveryCode,
        pickupCode: finalPickupCode,
        status: 'PENDING',
        items: {
          create: items.map((item: OrderItem) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });

    // Update product stock quantities
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (product && product.inventory) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            inventory: {
              ...product.inventory,
              stockQuantity: product.inventory.stockQuantity - item.quantity,
            },
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order created successfully',
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}