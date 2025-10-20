import { MerchantType, type Merchant } from '@prisma/client';
import { create } from 'zustand';
import { createJSONStorage, persist, } from 'zustand/middleware';

export interface CachedMerchant extends Merchant {
    id: string;
    businessName: string;
    slug: string;
    phone: string;
    logoUrl: string | null;
    bannerUrl: string | null;
    isVerified: boolean;
    merchantType: MerchantType;
    address: {
        latitude: number;
        longitude: number;
    };
    deliveryTime: string | null;
    rating: number | null;
    cachedAt: number;
}

interface MerchantStore {
    merchants: Map<string, CachedMerchant>;
    currentMerchantId: string | null;
    setCurrentMerchant: (merchantId: string) => void;
    getCurrentMerchant: () => CachedMerchant | null;
    getMerchant: (merchantId: string) => CachedMerchant | null;
    addMerchant: (merchant: Omit<CachedMerchant, 'cachedAt'>) => void;
    updateMerchant: (merchantId: string, data: Partial<CachedMerchant>) => void;
    removeMerchant: (merchantId: string) => void;
    clearCache: () => void;
    isCacheValid: (merchantId: string, maxAgeMs?: number) => boolean;
}

const DEFAULT_CACHE_DURATION = 30 * 60 * 1000;

export const useMerchantStore = create<MerchantStore>()(
    persist(
        (set, get) => ({
            merchants: new Map(),
            currentMerchantId: null,

            setCurrentMerchant: (merchantId: string) => {
                set({ currentMerchantId: merchantId });
            },

            getCurrentMerchant: () => {
                const { currentMerchantId, merchants } = get();
                if (!currentMerchantId) return null;
                return merchants.get(currentMerchantId) || null;
            },

            getMerchant: (merchantId: string) => {
                const { merchants } = get();
                return merchants.get(merchantId) || null;
            },

            addMerchant: (merchant: Omit<CachedMerchant, 'cachedAt'>) => {
                set((state) => {
                    const newMerchants = new Map(state.merchants);
                    newMerchants.set(merchant.id, {
                        ...merchant,
                        cachedAt: Date.now(),
                    });
                    return { merchants: newMerchants };
                });
            },

            updateMerchant: (merchantId: string, data: Partial<CachedMerchant>) => {
                set((state) => {
                    const merchant = state.merchants.get(merchantId);
                    if (!merchant) return state;

                    const newMerchants = new Map(state.merchants);
                    newMerchants.set(merchantId, {
                        ...merchant,
                        ...data,
                        cachedAt: Date.now(),
                    });
                    return { merchants: newMerchants };
                });
            },

            removeMerchant: (merchantId: string) => {
                set((state) => {
                    const newMerchants = new Map(state.merchants);
                    newMerchants.delete(merchantId);
                    return { merchants: newMerchants };
                });
            },

            clearCache: () => {
                set({ merchants: new Map(), currentMerchantId: null });
            },

            isCacheValid: (merchantId: string, maxAgeMs = DEFAULT_CACHE_DURATION) => {
                const merchant = get().merchants.get(merchantId);
                if (!merchant) return false;

                const age = Date.now() - merchant.cachedAt;
                return age < maxAgeMs;
            },
        }),
        {
            name: 'merchant-cache',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                merchants: Array.from(state.merchants.entries()),
                currentMerchantId: state.currentMerchantId,
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
        getMerchant,
        addMerchant,
        setCurrentMerchant,
        isCacheValid,
    } = useMerchantStore();

    const fetchMerchant = async (id: string, forceRefresh = false): Promise<CachedMerchant | null> => {
        try {
            if (!forceRefresh && isCacheValid(id)) {
                const cached = getMerchant(id);
                if (cached) {
                    setCurrentMerchant(id);
                    return cached;
                }
            }

            const response = await fetch(`/api/v1/merchants/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch merchant');
            }

            const data = await response.json();
            const merchant = data.data;

            addMerchant(merchant);
            setCurrentMerchant(id);

            return merchant;
        } catch (error) {
            console.error('Error fetching merchant:', error);
            return null;
        }
    };

    return {
        merchant: merchantId ? getMerchant(merchantId) : null,
        fetchMerchant,
        isCached: merchantId ? isCacheValid(merchantId) : false,
    };
};

export const usePrefetchMerchants = () => {
    const { addMerchant, isCacheValid } = useMerchantStore();

    const prefetchMerchants = async (merchantIds: string[]) => {
        const uncachedIds = merchantIds.filter(id => !isCacheValid(id));

        if (uncachedIds.length === 0) return;

        try {
            const promises = uncachedIds.map(id =>
                fetch(`/api/v1/merchants/${id}`).then(res => res.json())
            );

            const results = await Promise.allSettled(promises);

            results.forEach((result) => {
                if (result.status === 'fulfilled' && result.value.success) {
                    addMerchant(result.value.data);
                }
            });
        } catch (error) {
            console.error('Error prefetching merchants:', error);
        }
    };

    return { prefetchMerchants };
};