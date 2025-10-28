// File: /hooks/use-withdrawal.ts
// Unified hook for withdrawal management with intelligent polling

"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
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

interface UseWithdrawalReturn {
    latestWithdrawal: WithdrawalData | null;
    stats: WithdrawalStats | null;
    withdrawals: WithdrawalData[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    hasPendingWithdrawal: boolean;
}

/**
 * Hook for managing withdrawals with intelligent polling
 * Polling intervals:
 * - PENDING/INITIALIZATION: 5 seconds
 * - COMPLETED/FAILED: Stop polling
 * - No withdrawal: Stop polling
 */
export function useWithdrawal(userType: WalletUserType): UseWithdrawalReturn {
    const [latestWithdrawal, setLatestWithdrawal] = useState<WithdrawalData | null>(null);
    const [stats, setStats] = useState<WithdrawalStats | null>(null);
    const [withdrawals, setWithdrawals] = useState<WithdrawalData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchWithdrawalData = useCallback(async () => {
        try {
            const response = await fetch(`/api/v1/wallet/withdrawal?userType=${userType}`);
            const data = await response.json();

            if (data.success) {
                setLatestWithdrawal(data.data.latestWithdrawal);
                setStats(data.data.stats);
                setWithdrawals(data.data.withdrawals);
                setError(null);
            } else {
                setError(data.message || 'Failed to fetch withdrawal data');
            }
        } catch (err) {
            console.error('Error fetching withdrawal data:', err);
            setError('Failed to fetch withdrawal data');
        } finally {
            setLoading(false);
        }
    }, [userType]);

    // Setup intelligent polling
    useEffect(() => {
        // Initial fetch
        fetchWithdrawalData();

        // Clear any existing interval
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        // Determine polling interval based on latest withdrawal status
        const shouldPoll = latestWithdrawal && 
            (latestWithdrawal.status === WithdrawalStatus.PENDING || 
             latestWithdrawal.status === WithdrawalStatus.INITIALIZATION);

        if (shouldPoll) {
            // Poll every 5 seconds for pending withdrawals
            pollingIntervalRef.current = setInterval(() => {
                fetchWithdrawalData();
            }, 5000);
        }

        // Cleanup on unmount or when dependencies change
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [fetchWithdrawalData, latestWithdrawal?.status]);

    const hasPendingWithdrawal = latestWithdrawal !== null && 
        (latestWithdrawal.status === WithdrawalStatus.PENDING || 
         latestWithdrawal.status === WithdrawalStatus.INITIALIZATION);

    return {
        latestWithdrawal,
        stats,
        withdrawals,
        loading,
        error,
        refetch: fetchWithdrawalData,
        hasPendingWithdrawal,
    };
}
