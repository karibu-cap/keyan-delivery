"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ArrowUpCircle,
    ArrowDownCircle,
    Receipt,
    ChevronLeft,
    ChevronRight,
    Filter,
} from 'lucide-react';
import { TransactionStatus, TransactionType } from '@prisma/client';
import { useT } from '@/hooks/use-inline-translation';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Transaction {
    id: string;
    amount: number;
    type: TransactionType;
    description: string;
    status: TransactionStatus;
    createdAt: Date;
    orderId: string | null;
}

interface TransactionsListProps {
    transactions: Transaction[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    merchantId: string;
    currentFilters: {
        type?: TransactionType;
        status?: TransactionStatus;
        page: number;
    };
}

export default function TransactionsList({
    transactions,
    pagination,
    merchantId,
    currentFilters,
}: TransactionsListProps) {
    const t = useT();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [filterType, setFilterType] = useState<string>(currentFilters.type || 'all');
    const [filterStatus, setFilterStatus] = useState<string>(currentFilters.status || 'all');

    const updateFilters = (newFilters: { type?: string; status?: string; page?: number }) => {
        const params = new URLSearchParams(searchParams);

        if (newFilters.type && newFilters.type !== 'all') {
            params.set('type', newFilters.type);
        } else {
            params.delete('type');
        }

        if (newFilters.status && newFilters.status !== 'all') {
            params.set('status', newFilters.status);
        } else {
            params.delete('status');
        }

        if (newFilters.page && newFilters.page > 1) {
            params.set('page', newFilters.page.toString());
        } else {
            params.delete('page');
        }

        router.push(`/merchant/${merchantId}/wallet?${params.toString()}`);
    };

    const handleTypeChange = (value: string) => {
        setFilterType(value);
        updateFilters({ type: value, status: filterStatus, page: 1 });
    };

    const handleStatusChange = (value: string) => {
        setFilterStatus(value);
        updateFilters({ type: filterType, status: value, page: 1 });
    };

    const handlePageChange = (newPage: number) => {
        updateFilters({ type: filterType, status: filterStatus, page: newPage });
    };

    const getStatusColor = (status: TransactionStatus) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-primary/10 text-green-800 dark:bg-primary dark:text-primary/30';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'FAILED':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="w-5 h-5" />
                        {t('Transaction History')}
                    </CardTitle>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Select value={filterType} onValueChange={handleTypeChange}>
                            <SelectTrigger className="w-[140px]">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder={t('Type')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('All Types')}</SelectItem>
                                <SelectItem value="credit">{t('Credit')}</SelectItem>
                                <SelectItem value="debit">{t('Debit')}</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filterStatus} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-[140px]">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder={t('Status')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('All Status')}</SelectItem>
                                <SelectItem value="COMPLETED">{t('Completed')}</SelectItem>
                                <SelectItem value="PENDING">{t('Pending')}</SelectItem>
                                <SelectItem value="FAILED">{t('Failed')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {transactions.length === 0 ? (
                    <div className="text-center py-12">
                        <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                        <p className="text-muted-foreground">{t('No transactions found')}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {t('Transactions will appear here once you start receiving payments')}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Transactions List */}
                        <div className="space-y-3">
                            {transactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        {/* Icon */}
                                        <div
                                            className={cn(
                                                'p-2 rounded-full flex-shrink-0',
                                                transaction.type === 'credit'
                                                    ? 'bg-primary/10 dark:bg-primary'
                                                    : 'bg-red-100 dark:bg-red-900'
                                            )}
                                        >
                                            {transaction.type === 'credit' ? (
                                                <ArrowUpCircle className="w-5 h-5 text-primary/60 dark:text-primary/40" />
                                            ) : (
                                                <ArrowDownCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">
                                                {transaction.description}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                                <Badge className={cn('text-xs', getStatusColor(transaction.status))}>
                                                    {transaction.status}
                                                </Badge>
                                                {transaction.orderId && (
                                                    <span className="text-xs text-muted-foreground">
                                                        #{transaction.orderId.slice(-6)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div className="text-right flex-shrink-0 ml-4">
                                        <p
                                            className={cn(
                                                'font-bold text-lg',
                                                transaction.type === 'credit'
                                                    ? 'text-primary/60 dark:text-primary/40'
                                                    : 'text-red-600 dark:text-red-400'
                                            )}
                                        >
                                            {transaction.type === 'credit' ? '+' : '-'}
                                            {formatCurrency(transaction.amount)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-6 border-t">
                                <p className="text-sm text-muted-foreground">
                                    {t('Showing')} {(pagination.page - 1) * pagination.limit + 1} -{' '}
                                    {Math.min(pagination.page * pagination.limit, pagination.total)} {t('of')}{' '}
                                    {pagination.total} {t('transactions')}
                                </p>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        {t('Previous')}
                                    </Button>

                                    <div className="flex items-center gap-1">
                                        {[...Array(pagination.totalPages)].map((_, i) => {
                                            const pageNum = i + 1;
                                            // Show first, last, current, and adjacent pages
                                            if (
                                                pageNum === 1 ||
                                                pageNum === pagination.totalPages ||
                                                (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                                            ) {
                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        variant={pageNum === pagination.page ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => handlePageChange(pageNum)}
                                                        className="w-8 h-8 p-0"
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                );
                                            } else if (
                                                pageNum === pagination.page - 2 ||
                                                pageNum === pagination.page + 2
                                            ) {
                                                return <span key={pageNum} className="text-muted-foreground">...</span>;
                                            }
                                            return null;
                                        })}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page === pagination.totalPages}
                                    >
                                        {t('Next')}
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}