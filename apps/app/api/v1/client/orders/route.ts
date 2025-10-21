import { resolveDeliveryCoordinates, validateCoordinatesInZones } from '@/lib/actions/server/delivery-zones';
import { getUserTokens } from '@/lib/firebase-client/server-firebase-utils';
import { notifyMerchantNewOrder } from '@/lib/notifications/push-service';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';
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
      deliveryZoneId
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Items are required' },
        { status: 400 }
      );
    }

    if (!deliveryInfo || !deliveryInfo.deliveryContact) {
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

    console.log('🔍 Resolving coordinates for order...');
    console.log('Zone ID:', deliveryZoneId);
    console.log('Address:', deliveryInfo.additionalNote);
    console.log('Landmark Name:', deliveryInfo.landmarkName);
    console.log('Manual Coordinates:', deliveryInfo.manualCoordinates);

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


    if (deliveryInfo.manualCoordinates) {
      console.log('📍 Validating manual coordinates...');

      const isInZone = await validateCoordinatesInZones(deliveryInfo.manualCoordinates);

      if (!isInZone) {
        console.error('❌ Manual coordinates outside all delivery zones!');
        return NextResponse.json(
          {
            success: false,
            error: 'Selected location is outside our delivery zones. Please select a location within the highlighted area.'
          },
          { status: 400 }
        );
      }

      console.log('✅ Manual coordinates validated - within zone');
    }

    // Generate codes if not provided
    const finalDeliveryCode = deliveryCode || Math.random().toString(36).substring(2, 8).toUpperCase();
    const resolvedCoordinates = await resolveDeliveryCoordinates(
      deliveryZoneId,
      deliveryInfo.additionalNote,
      deliveryInfo.landmarkName,
      deliveryInfo.manualCoordinates
    );

    console.log('✅ Coordinates resolved:', {
      coordinates: resolvedCoordinates.coordinates,
      source: resolvedCoordinates.source,
      confidence: resolvedCoordinates.confidence,
      landmark: resolvedCoordinates.landmark
    });

    // Calculate estimated delivery time
    const estimatedDelivery = deliveryZone.estimatedDeliveryMinutes
      ? new Date(Date.now() + deliveryZone.estimatedDeliveryMinutes * 60 * 1000)
      : null;

    // Create order with items and delivery zone
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        merchantId: items[0].merchantId,
        deliveryZoneId: deliveryZoneId,
        deliveryInfo: {
          additionalNotes: deliveryInfo.additionalNotes,
          deliveryContact: deliveryInfo.deliveryContact,
          estimatedDelivery: estimatedDelivery,
          location: resolvedCoordinates.coordinates,
          landmark: resolvedCoordinates.landmark,
          coordinateSource: resolvedCoordinates.source,
          coordinateConfidence: resolvedCoordinates.confidence
        },
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        orderPrices: orderPrices,
        status: OrderStatus.PENDING,
        deliveryCode: finalDeliveryCode,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                merchant: true,
              },
            },
          },
        },
        deliveryZone: true,
      },
    });

    console.log('✅ Order created successfully:', order.id);
    console.log('📊 Order details:');
    console.log('  - Coordinate source:', order.deliveryInfo.coordinateSource);
    console.log('  - Coordinate confidence:', order.deliveryInfo.coordinateConfidence);
    console.log('  - Location:', order.deliveryInfo.location);

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
      console.log('Start notify the partner .......')
      await notifyMerchantNewOrder(
        order.merchantId,
        order.id,
        order.orderPrices.total,
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
