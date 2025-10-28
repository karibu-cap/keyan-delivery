// File: /components/wallet/WithdrawalStatsCards.tsx
// Stats cards for withdrawal page

"use client";

import AnimatedStatsCard from "@/components/driver/AnimatedStatsCard";
import { ArrowDownToLine, CheckCircle2, XCircle, Clock } from "lucide-react";

interface WithdrawalStats {
    total: number;
    successful: number;
    failed: number;
    pending: number;
}

interface WithdrawalStatsCardsProps {
    stats: WithdrawalStats | null;
    loading?: boolean;
}

export function WithdrawalStatsCards({ stats, loading = false }: WithdrawalStatsCardsProps) {
    return (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <AnimatedStatsCard
                title="Total Withdrawals"
                value={stats?.total || 0}
                icon={ArrowDownToLine}
                color="text-blue-600"
                bgColor="bg-blue-50 dark:bg-blue-950/20"
                borderColor="border-blue-200 dark:border-blue-800"
                loading={loading}
                animationDelay={0}
            />

            <AnimatedStatsCard
                title="Successful"
                value={stats?.successful || 0}
                icon={CheckCircle2}
                color="text-green-600"
                bgColor="bg-green-50 dark:bg-green-950/20"
                borderColor="border-green-200 dark:border-green-800"
                loading={loading}
                animationDelay={100}
            />

            <AnimatedStatsCard
                title="Failed"
                value={stats?.failed || 0}
                icon={XCircle}
                color="text-red-600"
                bgColor="bg-red-50 dark:bg-red-950/20"
                borderColor="border-red-200 dark:border-red-800"
                loading={loading}
                animationDelay={200}
            />

            <AnimatedStatsCard
                title="In Progress"
                value={stats?.pending || 0}
                icon={Clock}
                color="text-orange-600"
                bgColor="bg-orange-50 dark:bg-orange-950/20"
                borderColor="border-orange-200 dark:border-orange-800"
                loading={loading}
                animationDelay={300}
            />
        </div>
    );
}
