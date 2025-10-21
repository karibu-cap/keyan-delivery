import { prisma } from '@/lib/prisma';
import { TransactionStatus, TransactionType } from '@prisma/client';

export interface TransactionFilters {
    type?: TransactionType;
    status?: TransactionStatus;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
}

export interface PaginatedTransactions {
    transactions: Array<{
        id: string;
        amount: number;
        type: TransactionType;
        description: string;
        status: TransactionStatus;
        createdAt: Date;
        orderId: string | null;
    }>;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

/**
 * Get merchant wallet with balance
 */
export async function getMerchantWallet(merchantId: string) {
    try {
        // Get the merchant to find the user
        const merchant = await prisma.merchant.findUnique({
            where: { id: merchantId },
            include: {
                managers: {
                    include: {
                        user: {
                            include: {
                                wallet: true,
                            },
                        },
                    },
                },
            },
        });

        if (!merchant || merchant.managers.length === 0) {
            return { ok: false, error: 'Merchant not found' };
        }

        const user = merchant.managers[0].user;

        // Get or create wallet
        let wallet = user.wallet;
        if (!wallet) {
            wallet = await prisma.wallet.create({
                data: {
                    userId: user.id,
                    balance: 0,
                    currency: 'USD',
                },
            });
        }

        return {
            ok: true,
            data: {
                id: wallet.id,
                balance: wallet.balance,
                currency: wallet.currency,
                updatedAt: wallet.updatedAt,
            },
        };
    } catch (error) {
        console.error('Error fetching merchant wallet:', error);
        return { ok: false, error: 'Failed to fetch wallet' };
    }
}

/**
 * Get merchant transactions with filters and pagination
 */
export async function getMerchantTransactions(
    merchantId: string,
    filters: TransactionFilters = {}
): Promise<{ ok: boolean; data?: PaginatedTransactions; error?: string }> {
    try {
        const {
            type,
            status,
            startDate,
            endDate,
            page = 1,
            limit = 10,
        } = filters;

        // Get the merchant's wallet
        const merchant = await prisma.merchant.findUnique({
            where: { id: merchantId },
            include: {
                managers: {
                    include: {
                        user: {
                            include: {
                                wallet: true,
                            },
                        },
                    },
                },
            },
        });

        if (!merchant || merchant.managers.length === 0) {
            return { ok: false, error: 'Merchant not found' };
        }

        const wallet = merchant.managers[0].user.wallet;
        if (!wallet) {
            return {
                ok: true,
                data: {
                    transactions: [],
                    pagination: {
                        total: 0,
                        page: 1,
                        limit,
                        totalPages: 0,
                    },
                },
            };
        }

        // Build where clause
        const where: any = {
            walletId: wallet.id,
        };

        if (type) {
            where.type = type;
        }

        if (status) {
            where.status = status;
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = startDate;
            }
            if (endDate) {
                where.createdAt.lte = endDate;
            }
        }

        // Get total count
        const total = await prisma.transaction.count({ where });

        // Get transactions with pagination
        const transactions = await prisma.transaction.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            ok: true,
            data: {
                transactions: transactions.map((t) => ({
                    id: t.id,
                    amount: t.amount,
                    type: t.type,
                    description: t.description,
                    status: t.status,
                    createdAt: t.createdAt,
                    orderId: t.orderId,
                })),
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            },
        };
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return { ok: false, error: 'Failed to fetch transactions' };
    }
}

/**
 * Get transaction statistics for the merchant
 */
export async function getTransactionStats(merchantId: string) {
    try {
        const merchant = await prisma.merchant.findUnique({
            where: { id: merchantId },
            include: {
                managers: {
                    include: {
                        user: {
                            include: {
                                wallet: {
                                    include: {
                                        transactions: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!merchant || merchant.managers.length === 0) {
            return { ok: false, error: 'Merchant not found' };
        }

        const wallet = merchant.managers[0].user.wallet;
        if (!wallet) {
            return {
                ok: true,
                data: {
                    totalCredit: 0,
                    totalDebit: 0,
                    pendingAmount: 0,
                    completedTransactions: 0,
                },
            };
        }

        const transactions = wallet.transactions;

        const totalCredit = transactions
            .filter((t) => t.type === 'credit' && t.status === 'COMPLETED')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalDebit = transactions
            .filter((t) => t.type === 'debit' && t.status === 'COMPLETED')
            .reduce((sum, t) => sum + t.amount, 0);

        const pendingAmount = transactions
            .filter((t) => t.status === 'PENDING')
            .reduce((sum, t) => sum + t.amount, 0);

        const completedTransactions = transactions.filter(
            (t) => t.status === 'COMPLETED'
        ).length;

        return {
            ok: true,
            data: {
                totalCredit,
                totalDebit,
                pendingAmount,
                completedTransactions,
            },
        };
    } catch (error) {
        console.error('Error fetching transaction stats:', error);
        return { ok: false, error: 'Failed to fetch stats' };
    }
}