"use server";

import { sendNotificationToUser } from '@/lib/notifications/push-service';
import { prisma } from '@/lib/prisma';
import { MessageChannel, MessageData, RecipientType } from '@/types/messaging';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from './admin-guard';




// Get merchant managers based on recipient type
async function getMerchantRecipients(data: MessageData) {
    const whereClause: any = {};

    switch (data.recipientType) {
        case RecipientType.SPECIFIC:
            if (!data.specificMerchantIds || data.specificMerchantIds.length === 0) {
                throw new Error('No merchants specified');
            }
            whereClause.merchantId = { in: data.specificMerchantIds };
            break;

        case RecipientType.BY_TYPE:
            if (!data.merchantType) {
                throw new Error('Merchant type not specified');
            }
            whereClause.merchant = { merchantType: data.merchantType };
            break;

        case RecipientType.VERIFIED:
            whereClause.merchant = { isVerified: true };
            break;

        case RecipientType.UNVERIFIED:
            whereClause.merchant = { isVerified: false };
            break;

        case RecipientType.ALL:
            // No filter
            break;

        default:
            throw new Error('Invalid recipient type');
    }

    const merchantManagers = await prisma.userMerchantManager.findMany({
        where: whereClause,
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    phone: true,
                },
            },
            merchant: {
                select: {
                    id: true,
                    businessName: true,
                    merchantType: true,
                    isVerified: true,
                },
            },
        },
    });

    // Deduplicate users (a user might manage multiple merchants)
    const uniqueUsers = new Map();
    merchantManagers.forEach((manager) => {
        if (!uniqueUsers.has(manager.user.id)) {
            uniqueUsers.set(manager.user.id, {
                ...manager.user,
                merchants: [manager.merchant],
            });
        } else {
            uniqueUsers.get(manager.user.id).merchants.push(manager.merchant);
        }
    });

    return Array.from(uniqueUsers.values());
}

// Send push notification
async function sendPushNotification(
    id: string,
    title: string,
    body: string,
    url?: string
) {
    try {
        await sendNotificationToUser(id, {
            title,
            body,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            data: {
                url: url || '/',
            },
            requireInteraction: false,
        });
        return { success: true };
    } catch (error) {
        console.error('Push notification error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// Send SMS (Placeholder - integrate with Twilio or similar)
async function sendSMS(phone: string, message: string) {
    try {
        // TODO: Integrate with Twilio or your SMS provider
        // Example Twilio integration:
        /*
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const client = require('twilio')(accountSid, authToken);
        
        await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone
        });
        */

        console.log(`SMS would be sent to ${phone}: ${message}`);

        // For now, simulate success
        return { success: true };
    } catch (error) {
        console.error('SMS error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// Send email (Placeholder - integrate with Resend, SendGrid, etc.)
async function sendEmail(email: string, subject: string, body: string) {
    try {
        // TODO: Integrate with Resend, SendGrid, or your email provider
        // Example with Resend:
        /*
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: 'Admin <admin@yourapp.com>',
          to: email,
          subject: subject,
          html: body
        });
        */

        console.log(`Email would be sent to ${email}: ${subject}`);

        // For now, simulate success
        return { success: true };
    } catch (error) {
        console.error('Email error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// Main send message function
export async function sendMessage(data: MessageData) {
    await requireAdmin();

    const recipients = await getMerchantRecipients(data);

    if (recipients.length === 0) {
        throw new Error('No recipients found matching the criteria');
    }

    const results = {
        total: recipients.length,
        sent: 0,
        delivered: 0,
        failed: 0,
        errors: [] as string[],
    };

    // Send messages based on channel
    for (const recipient of recipients) {
        const channelResults = {
            push: false,
            sms: false,
            email: false,
        };

        // Push notification
        if (data.channel === MessageChannel.PUSH || data.channel === MessageChannel.ALL) {
            const result = await sendPushNotification(
                recipient.id,
                data.title,
                data.body,
                data.url
            );
            channelResults.push = result.success;
        }

        // SMS
        if ((data.channel === MessageChannel.SMS || data.channel === MessageChannel.ALL) && recipient.phone) {
            const smsText = `${data.title}\n\n${data.body}`;
            const result = await sendSMS(recipient.phone, smsText);
            channelResults.sms = result.success;
        }

        // Email
        if ((data.channel === MessageChannel.EMAIL || data.channel === MessageChannel.ALL) && recipient.email) {
            const result = await sendEmail(recipient.email, data.title, data.body);
            channelResults.email = result.success;
        }

        // Update results
        const anySuccess = Object.values(channelResults).some((v) => v === true);
        if (anySuccess) {
            results.sent++;
            results.delivered++;
        } else {
            results.failed++;
            results.errors.push(`Failed to send to ${recipient.email}`);
        }
    }

    // Store message in history (create a Message model in Prisma if needed)
    // For now, we'll just return the results

    revalidatePath('/admin/notifications');

    return {
        success: true,
        results,
    };
}

// Get message templates
export async function getMessageTemplates() {
    await requireAdmin();

    return [
        {
            id: 'new_order_system',
            name: 'New Order System Update',
            title: 'Order System Update',
            body: 'We have updated our order management system. Please check your dashboard for new features.',
            channel: MessageChannel.ALL,
        },
        {
            id: 'payment_reminder',
            name: 'Payment Reminder',
            title: 'Payment Due',
            body: 'Your payment is due. Please complete the payment to continue receiving orders.',
            channel: MessageChannel.EMAIL,
        },
        {
            id: 'verification_required',
            name: 'Verification Required',
            title: 'Action Required: Verify Your Account',
            body: 'Your merchant account requires verification. Please submit the required documents.',
            channel: MessageChannel.ALL,
        },
        {
            id: 'promotion_opportunity',
            name: 'Promotion Opportunity',
            title: 'Boost Your Sales',
            body: 'Run a promotion this week and increase your visibility on our platform!',
            channel: MessageChannel.PUSH,
        },
        {
            id: 'system_maintenance',
            name: 'System Maintenance',
            title: 'Scheduled Maintenance',
            body: 'Our platform will undergo maintenance on [DATE] from [TIME] to [TIME]. Orders will be paused during this time.',
            channel: MessageChannel.ALL,
        },
    ];
}

// Get merchant statistics
export async function getMerchantStats() {
    await requireAdmin();

    const [total, verified, unverified, byType] = await Promise.all([
        prisma.merchant.count(),
        prisma.merchant.count({ where: { isVerified: true } }),
        prisma.merchant.count({ where: { isVerified: false } }),
        prisma.merchant.groupBy({
            by: ['merchantType'],
            _count: true,
        }),
    ]);

    return {
        total,
        verified,
        unverified,
        byType: byType.reduce((acc, item) => {
            acc[item.merchantType] = item._count;
            return acc;
        }, {} as Record<string, number>),
    };
}


// Test notification for single user (for testing purposes)
export async function sendTestNotification(userId: string) {
    await requireAdmin();

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, phone: true },
    });

    if (!user) {
        throw new Error('User not found');
    }

    const result = await sendPushNotification(
        user.id,
        'Test Notification',
        'This is a test notification from the admin panel.'
    );

    return result;
}