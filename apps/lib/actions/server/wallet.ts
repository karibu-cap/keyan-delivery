import { prisma } from '@/lib/prisma';
import { TransactionStatus, TransactionType, UserRole } from '@prisma/client';

export type WalletUserType = 'driver' | 'merchant' | 'customer';

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
                wallet: true,
            },
        });

        if (!merchant || merchant.managers.length === 0) {
            return { ok: false, error: 'Merchant not found' };
        }

        const user = merchant.managers[0].user;

        // Get or create wallet
        let wallet = merchant.wallet;
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

/**
 * Get wallet for any user type (unified)
 */
export async function getWalletByUserType(userId: string, userType: WalletUserType) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                wallet: true,
                merchantManagers: {
                    include: {
                        user: {
                            include: {
                                wallet: true,
                            },
                        },
                        merchant: {
                            include: {
                                wallet: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            return { ok: false, error: 'User not found' };
        }

        // Get the appropriate wallet based on user type
        let wallet;
        if (userType === 'merchant' && user.merchantManagers.length > 0) {
            wallet = user.merchantManagers[0].merchant.wallet;
        } else {
            wallet = user.wallet;
        }

        // Create wallet if it doesn't exist
        if (!wallet) {
            if (userType === 'merchant' && user.merchantManagers.length > 0) {
                wallet = await prisma.wallet.create({
                    data: {
                        merchantId: user.merchantManagers[0].merchant.id,
                        balance: 0,
                        currency: 'KES',
                    },
                });
            } else {
                wallet = await prisma.wallet.create({
                    data: {
                        userId: user.id,
                        balance: 0,
                        currency: 'KES',
                    },
                });
            }
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
        console.error('Error fetching wallet:', error);
        return { ok: false, error: 'Failed to fetch wallet' };
    }
}

/**
 * Get transaction stats for any user type (unified)
 */
export async function getTransactionStatsByUserType(userId: string, userType: WalletUserType) {
    try {
        const walletResponse = await getWalletByUserType(userId, userType);
        if (!walletResponse.ok || !walletResponse.data) {
            return { ok: false, error: 'Wallet not found' };
        }

        const [totalEarned, totalSpent, completedCount] = await Promise.all([
            prisma.transaction.aggregate({
                where: {
                    walletId: walletResponse.data.id,
                    type: TransactionType.credit,
                    status: TransactionStatus.COMPLETED,
                },
                _sum: { amount: true },
            }),
            prisma.transaction.aggregate({
                where: {
                    walletId: walletResponse.data.id,
                    type: TransactionType.debit,
                    status: TransactionStatus.COMPLETED,
                },
                _sum: { amount: true },
            }),
            prisma.transaction.count({
                where: {
                    walletId: walletResponse.data.id,
                    status: TransactionStatus.COMPLETED,
                },
            }),
        ]);

        return {
            ok: true,
            data: {
                totalEarned: totalEarned._sum?.amount || 0,
                totalSpent: totalSpent._sum?.amount || 0,
                completedTransactions: completedCount,
            },
        };
    } catch (error) {
        console.error('Error fetching transaction stats:', error);
        return { ok: false, error: 'Failed to fetch stats' };
    }
}

/**
 * Get transactions for any user type (unified)
 */
export async function getTransactionsByUserType(
    userId: string,
    userType: WalletUserType,
    filters: TransactionFilters = {}
): Promise<{ ok: boolean; data?: PaginatedTransactions; error?: string }> {
    try {
        const walletResponse = await getWalletByUserType(userId, userType);
        if (!walletResponse.ok || !walletResponse.data) {
            return { ok: false, error: 'Wallet not found' };
        }

        const {
            type,
            status,
            startDate,
            endDate,
            page = 1,
            limit = 10,
        } = filters;

        // Build where clause
        const where: any = {
            walletId: walletResponse.data.id,
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