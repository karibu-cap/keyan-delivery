"use client";

import { useAuthStore } from "@/hooks/use-auth-store";
import { getUserWallet } from "@/lib/actions/client/user";
import { Wallet } from "@prisma/client";
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface WalletState {
   balance: number;
   wallet: Wallet | null;
   loading: boolean;
   error: string | null;
   refreshWallet: () => Promise<void>;
}

export const useWallet = create(
   persist<WalletState>(
      (set,) => ({
         balance: 0,
         wallet: null,
         loading: false,
         error: null,
         refreshWallet: async () => {
            const { user } = useAuthStore.getState();
            if (!user?.id) return;

            set({ loading: true, error: null });

            try {
               const response = await getUserWallet(user.id);
               const data = await response;

               if (data.success) {
                  set({
                     balance: data.data.balance || 0,
                     wallet: data.data,
                     error: null
                  });
               } else {
                  set({ error: data.message || "Failed to load wallet" });
               }
            } catch (error) {
               console.error("Error loading wallet:", error);
               set({ error: "Failed to load wallet" });
            } finally {
               set({ loading: false });
            }
         },
      }),
      {
         name: 'wallet-store',
         storage: createJSONStorage(() => localStorage),
      }
   )
);
// Auto-refresh when user changes
useAuthStore.subscribe((state) => {
   if (state.user?.id) {
      useWallet.getState().refreshWallet();
   }
});