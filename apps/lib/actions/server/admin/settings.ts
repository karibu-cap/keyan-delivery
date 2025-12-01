'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from './admin-guard';

// Platform settings structure (stored in environment or database)
interface PlatformSettings {
    general: {
        platformName: string;
        platformEmail: string;
        platformPhone: string;
        currency: string;
        timezone: string;
    };
    orders: {
        autoAcceptOrders: boolean;
        orderTimeout: number;
        cancellationWindow: number;
        minOrderAmount: number;
    };
    delivery: {
        defaultDeliveryFee: number;
        freeDeliveryThreshold: number;
        maxDeliveryDistance: number;
        deliveryTimeSlots: boolean;
    };
    notifications: {
        emailNotifications: boolean;
        smsNotifications: boolean;
        pushNotifications: boolean;
        orderNotifications: boolean;
        promotionNotifications: boolean;
    };
    payments: {
        cashOnDelivery: boolean;
        mobilePayment: boolean;
        cardPayment: boolean;
        commission: number;
    };
}

// Default settings
const defaultSettings: PlatformSettings = {
    general: {
        platformName: 'Pataupesi Marketplace',
        platformEmail: 'admin@pataupesi.com',
        platformPhone: '+237 123 456 789',
        currency: 'XAF',
        timezone: 'Africa/Douala',
    },
    orders: {
        autoAcceptOrders: false,
        orderTimeout: 30,
        cancellationWindow: 5,
        minOrderAmount: 0,
    },
    delivery: {
        defaultDeliveryFee: 500,
        freeDeliveryThreshold: 10000,
        maxDeliveryDistance: 50,
        deliveryTimeSlots: false,
    },
    notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        orderNotifications: true,
        promotionNotifications: true,
    },
    payments: {
        cashOnDelivery: true,
        mobilePayment: true,
        cardPayment: false,
        commission: 15,
    },
};

// Get all platform settings
export async function getSettings(): Promise<PlatformSettings> {
    await requireAdmin();

    // In a real implementation, fetch from database or environment
    // For now, return default settings
    return defaultSettings;
}

// Update general settings
export async function updateGeneralSettings(data: Partial<PlatformSettings['general']>) {
    await requireAdmin();

    // In a real implementation, save to database
    console.log('Updating general settings:', data);

    revalidatePath('/admin/settings');
    return { success: true, message: 'General settings updated successfully' };
}

// Update order settings
export async function updateOrderSettings(data: Partial<PlatformSettings['orders']>) {
    await requireAdmin();

    // Validate order settings
    if (data.orderTimeout !== undefined && data.orderTimeout < 5) {
        throw new Error('Order timeout must be at least 5 minutes');
    }

    if (data.minOrderAmount !== undefined && data.minOrderAmount < 0) {
        throw new Error('Minimum order amount cannot be negative');
    }

    // In a real implementation, save to database
    console.log('Updating order settings:', data);

    revalidatePath('/admin/settings');
    return { success: true, message: 'Order settings updated successfully' };
}

// Update delivery settings
export async function updateDeliverySettings(data: Partial<PlatformSettings['delivery']>) {
    await requireAdmin();

    // Validate delivery settings
    if (data.defaultDeliveryFee !== undefined && data.defaultDeliveryFee < 0) {
        throw new Error('Default delivery fee cannot be negative');
    }

    if (data.maxDeliveryDistance !== undefined && data.maxDeliveryDistance <= 0) {
        throw new Error('Maximum delivery distance must be positive');
    }

    // In a real implementation, save to database
    console.log('Updating delivery settings:', data);

    revalidatePath('/admin/settings');
    return { success: true, message: 'Delivery settings updated successfully' };
}

// Update notification settings
export async function updateNotificationSettings(data: Partial<PlatformSettings['notifications']>) {
    await requireAdmin();

    // In a real implementation, save to database
    console.log('Updating notification settings:', data);

    revalidatePath('/admin/settings');
    return { success: true, message: 'Notification settings updated successfully' };
}

// Update payment settings
export async function updatePaymentSettings(data: Partial<PlatformSettings['payments']>) {
    await requireAdmin();

    // Validate payment settings
    if (data.commission !== undefined && (data.commission < 0 || data.commission > 100)) {
        throw new Error('Commission must be between 0 and 100');
    }

    // In a real implementation, save to database
    console.log('Updating payment settings:', data);

    revalidatePath('/admin/settings');
    return { success: true, message: 'Payment settings updated successfully' };
}

// Clear platform cache
export async function clearPlatformCache() {
    await requireAdmin();

    // In a real implementation, clear Redis or other cache
    console.log('Clearing platform cache');

    revalidatePath('/');
    return { success: true, message: 'Platform cache cleared successfully' };
}