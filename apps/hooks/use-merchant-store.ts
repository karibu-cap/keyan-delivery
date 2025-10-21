import { MerchantType } from '@prisma/client';
import { create } from 'zustand';
import { createJSONStorage, persist, } from 'zustand/middleware';


interface MerchantStore {
    merchantTypes: Map<string, MerchantType>;
    getMerchantType: (merchantId: string) => MerchantType | null;
    addMerchantType: (merchantId: string, merchantType: MerchantType) => void;
}

export const useMerchantStore = create<MerchantStore>()(
    persist(
        (set, get) => ({
            merchantTypes: new Map(),

            getMerchantType: (merchantId: string) => {
                const { merchantTypes } = get();
                return merchantTypes.get(merchantId) || null;
            },

            addMerchantType: (merchantId: string, merchantType: MerchantType) => {
                const { merchantTypes } = get();
                const newMerchants = new Map(merchantTypes);
                newMerchants.set(merchantId, merchantType);
                set({ merchantTypes: newMerchants });
            }
        }),
        {
            name: 'merchant-cache',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                merchants: Array.from(state.merchantTypes),
            }),
            merge: (persistedState: any, currentState) => ({
                ...currentState,
                merchants: new Map(persistedState?.merchants || []),
                currentMerchantId: persistedState?.currentMerchantId || null,
            }),
        }
    )
);

export const useMerchant = (merchantId: string | null) => {
    const {
        getMerchantType,
        addMerchantType,
    } = useMerchantStore();

    const fetchMerchantType = async (id: string): Promise<MerchantType | null> => {
        try {

            const response = await fetch(`/api/v1/merchants/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch merchant');
            }

            const data = await response.json();
            const merchant = data.data;

            addMerchantType(merchant.id, merchant.type);

            return merchant;
        } catch (error) {
            console.error('Error fetching merchant:', error);
            return null;
        }
    };

    return {
        merchantType: merchantId ? getMerchantType(merchantId) : null,
        fetchMerchantType,
    };
};