// File: /components/driver/DriverTransactionsList.tsx
// Driver transactions list component

"use client";

import React, { useState } from 'react';
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
import { Receipt, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useT } from '@/hooks/use-inline-translation';
import { ROUTES } from '@/lib/router';

interface Transaction {
    id: string;
    amount: number;
    type: 'credit' | 'debit';
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    description: string;
    createdAt: Date;
    order?: {
        id: string;
        deliveryInfo: any;
    } | null;
}

interface DriverTransactionsListProps {
    transactions: Transaction[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    currentFilters: {
        type?: string;
        status?: string;
        page: number;
    };
}

export default function DriverTransactionsList({
    transactions,
    pagination,
    currentFilters,
}: DriverTransactionsListProps) {
    const t = useT();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedType, setSelectedType] = useState<string>(currentFilters.type || 'all');
    const [selectedStatus, setSelectedStatus] = useState<string>(currentFilters.status || 'all');

    const updateFilters = (type?: string, status?: string, page?: number) => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (type && type !== 'all') {
            params.set('type', type);
        } else {
            params.delete('type');
        }
        
        if (status && status !== 'all') {
            params.set('status', status);
        } else {
            params.delete('status');
        }
        
        if (page) {
            params.set('page', page.toString());
        } else {
            params.delete('page');
        }

        router.push(`${ROUTES.driverWallet}?${params.toString()}`);
    };

    const handleTypeChange = (value: string) => {
        setSelectedType(value);
        updateFilters(value, selectedStatus, 1);
    };

    const handleStatusChange = (value: string) => {
        setSelectedStatus(value);
        updateFilters(selectedType, value, 1);
    };

    const handlePageChange = (newPage: number) => {
        updateFilters(selectedType, selectedStatus, newPage);
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
            COMPLETED: 'default',
            PENDING: 'secondary',
            FAILED: 'destructive',
        };
        return (
            <Badge variant={variants[status] || 'secondary'}>
                {status}
            </Badge>
        );
    };

    const getTypeBadge = (type: string) => {
        return (
            <Badge variant={type === 'credit' ? 'default' : 'outline'}>
                {type === 'credit' ? 'Credit' : 'Debit'}
            </Badge>
        );
    };

    if (transactions.length === 0) {
        return (
            <Card className="container mx-auto max-w-7xl px-4 mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="w-5 h-5" />
                        {t('Transaction History')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <Receipt className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">{t('No transactions found')}</h3>
                        <p className="text-muted-foreground">
                            {t('Transactions will appear here once you start receiving payments')}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="container mx-auto max-w-7xl px-4 mb-8 shadow-card">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="w-5 h-5" />
                        {t('Transaction History')}
                    </CardTitle>

                    {/* Filters */}
                    <div className="flex gap-2">
                        <Select value={selectedType} onValueChange={handleTypeChange}>
                            <SelectTrigger className="w-[140px]">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="credit">Credit</SelectItem>
                                <SelectItem value="debit">Debit</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={selectedStatus} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-[140px]">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="FAILED">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {/* Transactions List */}
                <div className="space-y-4">
                    {transactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    {getTypeBadge(transaction.type)}
                                    {getStatusBadge(transaction.status)}
                                </div>
                                <p className="font-medium">{transaction.description}</p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(transaction.createdAt).toLocaleDateString()} at{' '}
                                    {new Date(transaction.createdAt).toLocaleTimeString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p
                                    className={`text-lg font-bold ${
                                        transaction.type === 'credit'
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                    }`}
                                >
                                    {transaction.type === 'credit' ? '+' : '-'}KES{' '}
                                    {transaction.amount.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
