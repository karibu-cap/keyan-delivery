// File: /components/wallet/TransactionsList.tsx
// Unified transactions list component for all user types

"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionType, TransactionStatus } from '@prisma/client';
import { ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle2, XCircle, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/hooks/use-inline-translation';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Transaction {
    id: string;
    amount: number;
    type: TransactionType;
    description: string;
    status: TransactionStatus;
    createdAt: Date;
}

interface TransactionsListProps {
    transactions: Transaction[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    currentFilters: {
        type?: TransactionType;
        status?: TransactionStatus;
        page: number;
    };
    baseUrl: string;
}

export default function TransactionsList({
    transactions,
    pagination,
    currentFilters,
    baseUrl
}: TransactionsListProps) {
    const t = useT();
    const router = useRouter();
    const searchParams = useSearchParams();

    const getStatusIcon = (status: TransactionStatus) => {
        switch (status) {
            case TransactionStatus.COMPLETED:
                return <CheckCircle2 className="w-4 h-4 text-green-600" />;
            case TransactionStatus.PENDING:
                return <Clock className="w-4 h-4 text-orange-600" />;
            case TransactionStatus.FAILED:
                return <XCircle className="w-4 h-4 text-red-600" />;
            default:
                return <Clock className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status: TransactionStatus) => {
        switch (status) {
            case TransactionStatus.COMPLETED:
                return 'text-green-600 bg-green-50 dark:bg-green-950/20';
            case TransactionStatus.PENDING:
                return 'text-orange-600 bg-orange-50 dark:bg-orange-950/20';
            case TransactionStatus.FAILED:
                return 'text-red-600 bg-red-50 dark:bg-red-950/20';
            default:
                return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20';
        }
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`${baseUrl}?${params.toString()}`);
    };

    const handleTypeFilter = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'all') {
            params.delete('type');
        } else {
            params.set('type', value);
        }
        params.set('page', '1'); // Reset to page 1
        router.push(`${baseUrl}?${params.toString()}`);
    };

    const handleStatusFilter = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'all') {
            params.delete('status');
        } else {
            params.set('status', value);
        }
        params.set('page', '1'); // Reset to page 1
        router.push(`${baseUrl}?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push(baseUrl);
    };

    const hasActiveFilters = currentFilters.type || currentFilters.status;

    return (
        <div className="container mx-auto max-w-7xl px-4 pb-12">
            <Card className="shadow-card">
                <CardHeader>
                    <div className="space-y-4">
                        {/* Title and Filters Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <CardTitle className="flex items-center gap-3">
                                <span>{t('Transaction History')}</span>
                                <span className="text-sm font-normal text-muted-foreground">
                                    ({pagination.total})
                                </span>
                            </CardTitle>

                            {/* Filters */}
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Type Filter */}
                                <Select
                                    value={currentFilters.type || 'all'}
                                    onValueChange={handleTypeFilter}
                                >
                                    <SelectTrigger className="w-[130px] h-9">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t("All Types")}</SelectItem>
                                        <SelectItem value="credit">
                                            <div className="flex items-center gap-2">
                                                <ArrowUpCircle className="w-4 h-4 text-green-600" />
                                                {t("Credit")}
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="debit">
                                            <div className="flex items-center gap-2">
                                                <ArrowDownCircle className="w-4 h-4 text-red-600" />
                                                {t("Debit")}
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Status Filter */}
                                <Select
                                    value={currentFilters.status || 'all'}
                                    onValueChange={handleStatusFilter}
                                >
                                    <SelectTrigger className="w-[130px] h-9">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t("All Status")}</SelectItem>
                                        <SelectItem value="COMPLETED">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                {t("Completed")}
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="PENDING">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-orange-600" />
                                                {t("Pending")}
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="FAILED">
                                            <div className="flex items-center gap-2">
                                                <XCircle className="w-4 h-4 text-red-600" />
                                                {t("Failed")}
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Clear Filters Button */}
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="h-9 text-xs animate-in fade-in zoom-in duration-300"
                                    >
                                        <XCircle className="w-3 h-3 mr-1" />
                                        {t("Clear")}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Active Filters Badges */}
                        {hasActiveFilters && (
                            <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                {currentFilters.type && (
                                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                        {currentFilters.type === 'credit' ? (
                                            <>
                                                <ArrowUpCircle className="w-3 h-3" />
                                                {t("Credit Only")}
                                            </>
                                        ) : (
                                            <>
                                                <ArrowDownCircle className="w-3 h-3" />
                                                    {t("Debit Only")}
                                            </>
                                        )}
                                    </div>
                                )}
                                {currentFilters.status && (
                                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                        {currentFilters.status === 'COMPLETED' && (
                                            <>
                                                <CheckCircle2 className="w-3 h-3" />
                                                {t("Completed Only")}
                                            </>
                                        )}
                                        {currentFilters.status === 'PENDING' && (
                                            <>
                                                <Clock className="w-3 h-3" />
                                                {t("Pending Only")}
                                            </>
                                        )}
                                        {currentFilters.status === 'FAILED' && (
                                            <>
                                                <XCircle className="w-3 h-3" />
                                                {t("Failed Only")}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {transactions.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
                                    <div className="relative p-6 bg-primary/5 rounded-full">
                                        <Inbox className="w-12 h-12 text-primary/40 animate-bounce"
                                            style={{ animationDuration: '2s' }} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-lg font-medium text-muted-foreground">
                                        {t('No transactions found')}
                                    </p>
                                    <p className="text-sm text-muted-foreground/60">
                                        {t('Your transaction history will appear here')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {transactions.map((transaction, index) => (
                                <div
                                    key={transaction.id}
                                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-md animate-in fade-in slide-in-from-left-4"
                                    style={{
                                        animationDelay: `${index * 50}ms`,
                                        animationFillMode: 'backwards',
                                    }}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={cn(
                                            "p-2 rounded-lg",
                                            transaction.type === TransactionType.credit
                                                ? "bg-green-50 dark:bg-green-950/20"
                                                : "bg-red-50 dark:bg-red-950/20"
                                        )}>
                                            {transaction.type === TransactionType.credit ? (
                                                <ArrowUpCircle className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <ArrowDownCircle className="w-5 h-5 text-red-600" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">
                                                {transaction.description}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(transaction.createdAt).toLocaleDateString('en-KE', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className={cn(
                                                "font-bold text-lg",
                                                transaction.type === TransactionType.credit
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            )}>
                                                {transaction.type === TransactionType.credit ? '+' : '-'}
                                                KES {transaction.amount.toFixed(2)}
                                            </p>
                                            <div className={cn(
                                                "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                                                getStatusColor(transaction.status)
                                            )}>
                                                {getStatusIcon(transaction.status)}
                                                {transaction.status}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                    >
                                            {t("Previous")}
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                            {t("Page")} {pagination.page} {t("of")} {pagination.totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page === pagination.totalPages}
                                    >
                                            {t("Next")}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
