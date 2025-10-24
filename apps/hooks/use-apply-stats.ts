// hooks/use-apply-stats.ts
// Hook to fetch driver application stats

import { useEffect, useState } from 'react';

interface ApplyStats {
    requiredDocuments: number;
    avgReviewTimeHours: number;
    activeDriversCount: number;
    driversInReviewCount: number;
}

export function useApplyStats() {
    const [stats, setStats] = useState<ApplyStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/v1/driver/apply/stats');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch stats');
                }

                const data = await response.json();
                setStats(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching apply stats:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch stats');
                // Set fallback data on error
                setStats({
                    requiredDocuments: 2,
                    avgReviewTimeHours: 36,
                    activeDriversCount: 1250,
                    driversInReviewCount: 48,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return { stats, loading, error };
}
