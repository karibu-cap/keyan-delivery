import type { MerchantType } from "@prisma/client";

// Message types
export enum MessageChannel {
    PUSH,
    SMS,
    EMAIL,
    ALL,
}
export enum RecipientType {
    ALL,
    SPECIFIC,
    BY_TYPE,
    VERIFIED,
    UNVERIFIED,
}

export interface MessageData {
    channel: MessageChannel;
    recipientType: RecipientType;
    specificMerchantIds?: string[];
    merchantType?: MerchantType;
    title: string;
    body: string;
    url?: string;
    priority?: 'low' | 'normal' | 'high';
}

export interface MessageHistory {
    id: string;
    channel: MessageChannel;
    recipientType: RecipientType;
    recipientCount: number;
    title: string;
    body: string;
    sentAt: Date;
    sentBy: string;
    deliveryStatus: {
        sent: number;
        delivered: number;
        failed: number;
    };
}
