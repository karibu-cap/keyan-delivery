import { getUserTokens } from '@/lib/firebase-client/server-firebase-utils';
import { notifyMerchantNewOrder } from '@/lib/notifications/push-service';
import { prisma } from '@/lib/prisma';
import { OrderItem } from '@prisma/client';
import { getLocale } from 'next-intl/server';
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
    const {
      items,
      deliveryInfo,
      orderPrices,
      deliveryCode,
      deliveryZoneId // NEW: Delivery zone ID
    } = body;

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

    // NEW: Validate delivery zone
    if (!deliveryZoneId) {
      return NextResponse.json(
        { success: false, error: 'Delivery zone is required' },
        { status: 400 }
      );
    }

    // NEW: Verify delivery zone exists and is active
    const deliveryZone = await prisma.deliveryZone.findUnique({
      where: { id: deliveryZoneId }
    });

    if (!deliveryZone) {
      return NextResponse.json(
        { success: false, error: 'Invalid delivery zone' },
        { status: 404 }
      );
    }

    if (deliveryZone.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Selected delivery zone is not available' },
        { status: 400 }
      );
    }

    // NEW: Verify delivery fee matches the zone
    if (orderPrices.deliveryFee !== deliveryZone.deliveryFee) {
      return NextResponse.json(
        {
          success: false,
          error: 'Delivery fee mismatch. Please refresh and try again.'
        },
        { status: 400 }
      );
    }

    // Validate products and stock
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

    // NEW: Calculate estimated delivery time based on zone
    const estimatedDelivery = deliveryZone.estimatedDeliveryMinutes
      ? new Date(Date.now() + deliveryZone.estimatedDeliveryMinutes * 60 * 1000)
      : null;

    // Create order with items and delivery zone
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        merchantId: items[0].merchantId,
        deliveryZoneId: deliveryZoneId, // NEW: Link to delivery zone
        deliveryInfo: {
          address: deliveryInfo.address,
          location: deliveryInfo.location ? {
            type: "Point",
            coordinates: deliveryInfo.location.coordinates
          } : undefined,
          deliveryContact: deliveryInfo.deliveryContact,
          additionalNotes: deliveryInfo.additionalNotes || null,
          estimatedDelivery: estimatedDelivery,
        },
        orderPrices: {
          subtotal: orderPrices.subtotal,
          shipping: orderPrices.shipping,
          discount: orderPrices.discount || 0,
          total: orderPrices.total,
          deliveryFee: orderPrices.deliveryFee,
        },
        deliveryCode: finalDeliveryCode,
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
        deliveryZone: true, // NEW: Include delivery zone in response
        merchant: {
          select: {
            businessName: true,
            phone: true,
          }
        }
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


    try {
      const locale = await getLocale()
      await notifyMerchantNewOrder(
        order.merchantId,
        order.id,
        order.orderPrices.total,
        locale,
      );
      console.info('✅ Notification sent to merchant for new order:', order.id);
    } catch (error) {
      console.error({ message: '❌ Failed to send notification to merchant:', error });
    }

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order created successfully',
    });
  } catch (error) {
    console.error({ message: 'Error creating order:', error });
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
