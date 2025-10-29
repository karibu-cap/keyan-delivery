"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from "@/hooks/use-auth-store";
import { getUserWallet } from "@/lib/actions/client/user";
import { Wallet } from "@prisma/client";

// Query keys for wallet
export const walletKeys = {
    all: ['wallet'] as const,
    user: (userId: string) => [...walletKeys.all, userId] as const,
};

export function useWallet() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: walletKeys.user(user?.id || ''),
        queryFn: async () => {
            if (!user?.id) {
                throw new Error('User not authenticated');
            }

            const response = await getUserWallet(user.id);
            const data = await response.data;

            if (!data.success) {
                throw new Error(data.message || 'Failed to load wallet');
            }

            return data.data as Wallet;
        },
        enabled: !!user?.id,
        staleTime: 60000, // 1 minute
    });

    const refreshWallet = async () => {
        if (!user?.id) return;
        await queryClient.invalidateQueries({ queryKey: walletKeys.user(user.id) });
    };

    return {
        balance: data?.balance || 0,
        wallet: data || null,
        loading: isLoading,
        error: error?.message || null,
        refreshWallet,
        refetch,
    };
}
