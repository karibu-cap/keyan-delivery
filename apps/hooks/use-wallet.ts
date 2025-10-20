"use client";

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useAuthStore } from "@/hooks/auth-store";
import { getUserWallet } from "@/lib/actions/client/user";
import { Wallet } from "@prisma/client";

interface WalletState {
   balance: number;
   wallet: Wallet | null;
   loading: boolean;
   error: string | null;
   refreshWallet: () => Promise<void>;
}

export const useWallet = create(
   persist<WalletState>(
      (set, ) => ({
         balance: 0,
         wallet: null,
         loading: false,
         error: null,
         refreshWallet: async () => {
            const { user } = useAuthStore.getState();
            if (!user?.authId) return;

            set({ loading: true, error: null });

            try {
               const response = await getUserWallet(user.authId);
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
   if (state.user?.authId) {
      useWallet.getState().refreshWallet();
   }
});