"use client";

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Transaction } from "@prisma/client";
import { useWallet } from '@/hooks/use-wallet'
import { getTransactions } from "@/lib/actions/client/transactions";

interface TransactionsState {
    transactions: Transaction[];
    loading: boolean;
    error: string | null;
    refreshTransactions: () => Promise<void>;
}

export const useTransactions = create(
    persist<TransactionsState>(
        (set) => ({
            transactions: [],
            loading: false,
            error: null,
            refreshTransactions: async () => {
                const { wallet } = useWallet.getState();
                if (!wallet?.id) return;

                set({ loading: true, error: null });

                try {
                    const response = await getTransactions({ walletId: wallet.id });

                    if (response.success) {
                        set({
                            transactions: response.data,
                            error: null
                        });
                    } else {
                        set({ error: response.message || "Failed to load transactions" });
                    }
                } catch (error) {
                    console.error("Error fetching transactions:", error);
                    set({ error: "Failed to load transactions" });
                } finally {
                    set({ loading: false });
                }
            },
        }),
        {
            name: 'transactions-store',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// Auto-refresh when wallet changes
useWallet.subscribe((state) => {
    if (state.wallet?.id) {
        useTransactions.getState().refreshTransactions();
    }
});