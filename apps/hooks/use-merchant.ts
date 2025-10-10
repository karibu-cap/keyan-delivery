"use client";

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface Merchant {
    id: string;
    businessName?: string;
    phone?: string;
    address?: string;
    logoUrl?: string;
}

interface MerchantStore {
    currentMerchantId: string | null;
    currentMerchant: Merchant | null;
    setCurrentMerchant: (merchant: Merchant) => void;
    setCurrentMerchantId: (merchantId: string) => void;
    clearCurrentMerchant: () => void;
    isManagingMerchant: (merchantId: string) => boolean;
}

export const useMerchant = create(
    persist<MerchantStore>(
        (set, get) => ({
            currentMerchantId: null,
            currentMerchant: null,
            setCurrentMerchant: (merchant: Merchant) => {
                set({
                    currentMerchant: merchant,
                    currentMerchantId: merchant.id
                });
            },
            setCurrentMerchantId: (merchantId: string) => {
                set({ currentMerchantId: merchantId });
                // Clear current merchant data when just setting ID
                if (get().currentMerchant?.id !== merchantId) {
                    set({ currentMerchant: null });
                }
            },
            clearCurrentMerchant: () => {
                set({
                    currentMerchantId: null,
                    currentMerchant: null
                });
            },
            isManagingMerchant: (merchantId: string) => {
                return get().currentMerchantId === merchantId;
            },
        }),
        {
            name: 'merchant-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// Helper hook to get the current merchant ID from URL params if available
export const useMerchantFromParams = () => {
    const { currentMerchantId, setCurrentMerchantId } = useMerchant();
    const setMerchantFromParams = (merchantId: string) => {
        if (currentMerchantId !== merchantId) {
            setCurrentMerchantId(merchantId);
        }
    };

    return {
        currentMerchantId,
        setMerchantFromParams,
        isCurrentMerchant: (merchantId: string) => currentMerchantId === merchantId
    };
};