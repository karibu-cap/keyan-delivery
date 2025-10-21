import { getServerT } from '@/i18n/server-translations';
import { prisma } from '@/lib/prisma';
import webPush from 'web-push';

// fast push notification   
const vapidDetails = {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    privateKey: process.env.VAPID_PRIVATE_KEY!,
    subject: process.env.VAPID_SUBJECT || 'mailto:contact@delivery-app.com',
};

webPush.setVapidDetails(
    vapidDetails.subject,
    vapidDetails.publicKey,
    vapidDetails.privateKey
);

export interface NotificationPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    image?: string;
    tag?: string;
    data?: {
        url?: string;
        orderId?: string;
        [key: string]: any;
    };
    actions?: Array<{
        action: string;
        title: string;
        icon?: string;
    }>;
    requireInteraction?: boolean;
}

/**
 * Send a push notification to a specific user
 */
export async function sendNotificationToUser(
    authId: string,
    payload: NotificationPayload
): Promise<{ success: boolean; errors?: string[] }> {
    try {
        // Get all subscriptions for the user
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { authId },
        });

        if (subscriptions.length === 0) {
            console.info(`No push subscriptions found for user ${authId}`);
            return { success: false, errors: ['No subscriptions found'] };
        }
        // Send notification to all subscriptions
        const results = await Promise.allSettled(
            subscriptions.map(async (sub) => {
                try {
                    const pushSubscription = {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth,
                        },
                    };
                    await webPush.sendNotification(
                        pushSubscription,
                        JSON.stringify(payload),
                        {
                            TTL: 60 * 60 * 24,
                        }
                    );
                    return { success: true };
                } catch (error: any) {
                    console.error({ message: `Error sending notification to subscription ${sub.id}:`, error });

                    if (error.statusCode === 410) {
                        await prisma.pushSubscription.delete({
                            where: { id: sub.id },
                        });
                        console.info(`Deleted invalid subscription ${sub.id}`);
                    }
                    return { success: false };
                }
            })
        );

        // Check results
        const errors = results
            .filter((result) => result.status === 'rejected')
            .map((result) => (result as PromiseRejectedResult).reason.message);

        const successCount = results.filter((result) => result.status === 'fulfilled').length;

        console.info(`Sent ${successCount}/${subscriptions.length} notifications to user ${authId}`);

        return {
            success: successCount > 0,
            errors: errors.length > 0 ? errors : undefined,
        };
    } catch (error) {
        console.error({ message: 'Error in sendNotificationToUser:', error });
        return { success: false, errors: [String(error)] };
    }
}

/**
 * Send a notification to multiple users
 */
export async function sendNotificationToUsers(
    authIds: string[],
    payload: NotificationPayload
): Promise<{ success: boolean; results: Record<string, boolean> }> {
    const results: Record<string, boolean> = {};

    await Promise.all(
        authIds.map(async (authId) => {
            const result = await sendNotificationToUser(authId, payload);
            results[authId] = result.success;
        })
    );

    const successCount = Object.values(results).filter((success) => success).length;

    return {
        success: successCount > 0,
        results,
    };
}

/**
 * Send a notification for a new order (MERCHANT)
 */
export async function notifyMerchantNewOrder(
    merchantId: string,
    orderId: string,
    orderTotal: number,
) {
    // Find the managers of the merchant
    const merchantManagers = await prisma.userMerchantManager.findMany({
        where: { merchantId },
        include: { user: true },
    });
    const t = await getServerT();

    const authIds = merchantManagers.map((m) => m.user.authId);


    const payload: NotificationPayload = {
        title: t('🛒 New order!'),
        body: t(`You have received a new order of ${orderTotal.toFixed(2)} $`),
        icon: '/icons/ios/192.png',
        badge: '/icons/ios/72.png',
        tag: `new-order-${orderId}`,
        data: {
            url: `/merchant/orders/${orderId}`,
            orderId,
            type: 'new_order',
        },
        actions: [
            {
                action: 'view',
                title: t('View order'),
            },
        ],
        requireInteraction: true,
    };
    return await sendNotificationToUsers(authIds, payload);
}

/**
 * Send a notification for order status change (CLIENT)
 */
export async function notifyClientOrderStatusChange(props: {
    authId: string,
    orderId: string,
    newStatus: string,
    merchantName?: string
}) {
    const t = await getServerT();
    const statusMessages: Record<string, string> = {
        ACCEPTED_BY_MERCHANT: '✅ ' + t('Your order has been accepted by {merchantName}', { merchantName: props.merchantName }),
        REJECTED_BY_MERCHANT: '❌ ' + t('Your order has been rejected by {merchantName}', { merchantName: props.merchantName }),
        IN_PREPARATION: '👨‍🍳 ' + t('Your order is being prepared'),
        READY_TO_DELIVER: '📦 ' + t('Your order is ready for delivery'),
        ACCEPTED_BY_DRIVER: '🚗 ' + t('A driver has accepted your order'),
        ON_THE_WAY: '🛵 ' + t('Your order is on the way'),
        COMPLETED: '✅ ' + t('Your order has been delivered'),
        CANCELED_BY_MERCHANT: '❌ ' + t('Your order has been canceled by {merchantName}', { merchantName: props.merchantName }),
        CANCELED_BY_DRIVER: '❌ ' + t('Your order has been canceled by the driver'),
    };

    const payload: NotificationPayload = {
        title: t('Order status update'),
        body: statusMessages[props.newStatus] || t('The status of your order has changed'),
        icon: '/icons/ios/192.png',
        badge: '/icons/ios/72.png',
        tag: `order-status-${props.orderId}`,
        data: {
            url: `/orders/${props.orderId}`,
            orderId: props.orderId,
            status: props.newStatus,
            type: 'order_status_change',
            trackUrl: `/orders/${props.orderId}/track`,
        },
        actions: [
            {
                action: 'track',
                title: t('Track'),
            },
        ],
    };

    return await sendNotificationToUser(props.authId, payload);
}

/**
 * Send a notification for order ready (COURIER/DRIVER)
 */
export async function notifyDriverOrderReady(
    orderId: string,
    merchantName: string,
    pickupAddress: string,
) {
    const t = await getServerT();

    // Find all available drivers (APPROVED and without current order)
    const availableDrivers = await prisma.user.findMany({
        where: {
            roles: { has: 'driver' },
            driverStatus: 'APPROVED',
        },
    });

    const authIds = availableDrivers.map((d) => d.authId);

    if (authIds.length === 0) {
        console.info('No available drivers found');
        return { success: false, results: {} };
    }

    const payload: NotificationPayload = {
        title: t('📦 Order ready to pick up!'),
        body: t('An order is ready at ${merchantName'),
        icon: '/icons/ios/192.png',
        badge: '/icons/ios/72.png',
        tag: `order-ready-${orderId}`,
        data: {
            url: `/driver/orders/${orderId}`,
            orderId,
            merchantName,
            pickupAddress,
            type: 'order_ready',
        },
        actions: [
            {
                action: 'accept',
                title: t('Accepter'),
            },
            {
                action: 'view',
                title: t('View details'),
            },
        ],
        requireInteraction: true,
    };

    return await sendNotificationToUsers(authIds, payload);
}