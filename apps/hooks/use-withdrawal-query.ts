"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { WithdrawalStatus } from '@prisma/client';

export type WalletUserType = 'driver' | 'merchant' | 'customer';

interface WithdrawalData {
    id: string;
    amount: number;
    phoneNumber: string;
    status: WithdrawalStatus;
    createdAt: Date;
    transaction: {
        id: string;
        status: string;
    };
}

interface WithdrawalStats {
    total: number;
    successful: number;
    failed: number;
    pending: number;
}

interface WithdrawalResponse {
    latestWithdrawal: WithdrawalData | null;
    stats: WithdrawalStats;
    withdrawals: WithdrawalData[];
}

// Query keys
export const withdrawalKeys = {
    all: ['withdrawal'] as const,
    byUserType: (userType: WalletUserType) => [...withdrawalKeys.all, userType] as const,
};

/**
 * Fetch withdrawal data from API
 */
async function fetchWithdrawalData(userType: WalletUserType): Promise<WithdrawalResponse> {
    const response = await fetch(`/api/v1/wallet/withdrawal?userType=${userType}`);
    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || 'Failed to fetch withdrawal data');
    }

    return data.data;
}

/**
 * Determine if withdrawal should be polled
 */
function shouldPollWithdrawal(data: WithdrawalResponse | undefined): number | false {
    if (!data?.latestWithdrawal) return false;

    const isPending = 
        data.latestWithdrawal.status === WithdrawalStatus.PENDING || 
        data.latestWithdrawal.status === WithdrawalStatus.INITIALIZATION;

    // Poll every 5 seconds for pending withdrawals
    return isPending ? 5000 : false;
}

/**
 * Hook for managing withdrawals with intelligent polling
 * 
 * Polling intervals:
 * - PENDING/INITIALIZATION: 5 seconds
 * - COMPLETED/FAILED: Stop polling
 * - No withdrawal: Stop polling
 */
export function useWithdrawal(userType: WalletUserType) {
    const queryClient = useQueryClient();

    const {
        data,
        isLoading: loading,
        error,
        refetch,
    } = useQuery({
        queryKey: withdrawalKeys.byUserType(userType),
        queryFn: () => fetchWithdrawalData(userType),
        staleTime: 10000, // 10 seconds
        refetchInterval: (query) => {
            // Intelligent polling based on withdrawal status
            return shouldPollWithdrawal(query.state.data);
        },
        refetchIntervalInBackground: false, // Disable background polling to reduce server load
        retry: 2,
    });

    // Helper to check if there's a pending withdrawal
    const hasPendingWithdrawal = 
        data?.latestWithdrawal !== null && 
        (data?.latestWithdrawal?.status === WithdrawalStatus.PENDING || 
         data?.latestWithdrawal?.status === WithdrawalStatus.INITIALIZATION);

    return {
        latestWithdrawal: data?.latestWithdrawal ?? null,
        stats: data?.stats ?? null,
        withdrawals: data?.withdrawals ?? [],
        loading,
        error: error?.message ?? null,
        refetch,
        hasPendingWithdrawal,
    };
}

/**
 * Hook to manually invalidate withdrawal cache
 * Useful after creating a new withdrawal
 */
export function useInvalidateWithdrawal() {
    const queryClient = useQueryClient();

    return (userType?: WalletUserType) => {
        if (userType) {
            queryClient.invalidateQueries({ queryKey: withdrawalKeys.byUserType(userType) });
        } else {
            queryClient.invalidateQueries({ queryKey: withdrawalKeys.all });
        }
    };
}

/**
 * Hook to prefetch withdrawal data
 */
export function usePrefetchWithdrawal() {
    const queryClient = useQueryClient();

    return (userType: WalletUserType) => {
        queryClient.prefetchQuery({
            queryKey: withdrawalKeys.byUserType(userType),
            queryFn: () => fetchWithdrawalData(userType),
            staleTime: 10000,
        });
    };
}
