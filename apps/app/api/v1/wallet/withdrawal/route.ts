// File: /app/api/v1/wallet/withdrawal/route.ts
// Unified API endpoint for withdrawal requests (driver, merchant, client)

import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { UserRole, Wallet, WithdrawalStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const MIN_WITHDRAWAL_AMOUNT = 500; // KES

/**
 * POST /api/v1/wallet/withdrawal
 * Request withdrawal to MTN Mobile Money (unified for all user types)
 */
export async function POST(request: NextRequest) {
   try {
      const session = await getSession();

      if (!session?.user) {
         return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
         );
      }

      // Get user from database
      const user = await prisma.user.findUnique({
         where: { id: session.user.id },
         select: {
            id: true,
            roles: true,
            wallet: {
               select: {
                  id: true,
                  balance: true,
                  withdrawals: {
                     where: {
                        status: {
                           in: [WithdrawalStatus.PENDING, WithdrawalStatus.INITIALIZATION]
                        }
                     },
                     orderBy: { createdAt: 'desc' },
                     take: 1
                  }
               }
            },
            merchantManagers: {
               select: {
                  merchant: {
                     select: {
                        id: true,
                        wallet: {
                           select: {
                              id: true,
                              balance: true,
                              withdrawals: {
                                 where: {
                                    status: {
                                       in: [WithdrawalStatus.PENDING, WithdrawalStatus.INITIALIZATION]
                                    }
                                 },
                                 orderBy: { createdAt: 'desc' },
                                 take: 1
                              }
                           }
                        }
                     }
                  }
               }
            }
         },
      });

      if (!user) {
         return NextResponse.json(
            { success: false, message: "User not found" },
            { status: 404 }
         );
      }

      const body = await request.json();
      const { amount, phoneNumber, userType, merchantId } = body;

      // Validate user type
      if (!userType || !['driver', 'merchant', 'customer'].includes(userType)) {
         return NextResponse.json(
            { success: false, message: "Invalid user type" },
            { status: 400 }
         );
      }

      // Verify user has the correct role
      if (userType === 'driver' && !user.roles.includes(UserRole.driver)) {
         return NextResponse.json(
            { success: false, message: "Only drivers can request driver withdrawals" },
            { status: 403 }
         );
      }

      if (userType === 'merchant' && !user.roles.includes(UserRole.merchant)) {
         return NextResponse.json(
            { success: false, message: "Only merchants can request merchant withdrawals" },
            { status: 403 }
         );
      }

      if (userType === 'customer' && !user.roles.includes(UserRole.customer)) {
         return NextResponse.json(
            { success: false, message: "Only customers can request customer withdrawals" },
            { status: 403 }
         );
      }

      // Get the appropriate wallet
      let wallet: any;
      if (userType === 'merchant') {
         if (!merchantId) {
            return NextResponse.json(
               { success: false, message: "merchantId is required for merchant withdrawals" },
               { status: 400 }
            );
         }

         // Find the specific merchant wallet
         const merchantManager = user.merchantManagers.find(
            (mm) => mm.merchant.id === merchantId
         );

         if (!merchantManager) {
            return NextResponse.json(
               { success: false, message: "You are not a manager of this merchant" },
               { status: 403 }
            );
         }

         wallet = merchantManager.merchant.wallet;
      } else {
         wallet = user.wallet;
      }

      if (!wallet) {
         return NextResponse.json(
            { success: false, message: "Wallet not found" },
            { status: 404 }
         );
      }

      // Check for pending withdrawals
      if (wallet.withdrawals && wallet.withdrawals.length > 0) {
         return NextResponse.json(
            {
               success: false,
               message: "You already have a pending withdrawal. Please wait for it to complete.",
               pendingWithdrawal: wallet.withdrawals[0]
            },
            { status: 400 }
         );
      }

      // Validate amount
      if (!amount || isNaN(amount) || amount <= 0) {
         return NextResponse.json(
            { success: false, message: "Invalid withdrawal amount" },
            { status: 400 }
         );
      }

      // Check minimum withdrawal amount
      if (amount < MIN_WITHDRAWAL_AMOUNT) {
         return NextResponse.json(
            {
               success: false,
               message: `Minimum withdrawal amount is KES ${MIN_WITHDRAWAL_AMOUNT.toFixed(2)}`
            },
            { status: 400 }
         );
      }

      // Check sufficient balance
      if (amount > wallet.balance) {
         return NextResponse.json(
            {
               success: false,
               message: `Insufficient balance. Available: KES ${wallet.balance.toFixed(2)}`
            },
            { status: 400 }
         );
      }

      // Validate MTN Kenya phone number
      if (!phoneNumber || typeof phoneNumber !== 'string') {
         return NextResponse.json(
            { success: false, message: "MTN Mobile Money number is required" },
            { status: 400 }
         );
      }

      const phoneRegex = /^(\+254|254|0)[17]\d{8}$/;
      const cleanedNumber = phoneNumber.replace(/\s/g, "");

      if (!phoneRegex.test(cleanedNumber)) {
         return NextResponse.json(
            { success: false, message: "Invalid Kenyan MTN number format" },
            { status: 400 }
         );
      }

      // Normalize phone number to international format
      let normalizedNumber = cleanedNumber;
      if (normalizedNumber.startsWith('0')) {
         normalizedNumber = '+254' + normalizedNumber.substring(1);
      } else if (normalizedNumber.startsWith('254')) {
         normalizedNumber = '+' + normalizedNumber;
      }

      // Create withdrawal transaction in a transaction
      const result = await prisma.$transaction(async (tx) => {
         // Create transaction record
         const transaction = await tx.transaction.create({
            data: {
               walletId: wallet.id,
               amount,
               type: 'debit',
               status: 'PENDING',
               description: `Withdrawal to MTN ${normalizedNumber} - ${userType}`,
            },
         });

         // Create withdrawal record
         const withdrawal = await tx.withdrawal.create({
            data: {
               walletId: wallet.id,
               phoneNumber: normalizedNumber,
               amount,
               gateway: 'MTN_KENYA',
               status: 'INITIALIZATION',
               transactionId: transaction.id,
            },
         });

         // Update wallet balance (deduct amount)
         await tx.wallet.update({
            where: { id: wallet.id },
            data: {
               balance: {
                  decrement: amount,
               },
            },
         });

         return { transaction, withdrawal };
      });

      // TODO: Integrate with MTN Mobile Money API
      // For now, we just create the transaction as PENDING
      // In production, you would:
      // 1. Call MTN Mobile Money API to initiate payment
      // 2. Update transaction status based on API response
      // 3. Handle webhooks for payment confirmation

      return NextResponse.json({
         success: true,
         message: "Withdrawal request submitted successfully",
         data: {
            withdrawalId: result.withdrawal.id,
            transactionId: result.transaction.id,
            amount,
            phoneNumber: normalizedNumber,
            status: result.withdrawal.status,
         },
      });

   } catch (error) {
      console.error("Error processing withdrawal:", error);
      return NextResponse.json(
         {
            success: false,
            message: error instanceof Error ? error.message : "Failed to process withdrawal",
         },
         { status: 500 }
      );
   }
}

/**
 * GET /api/v1/wallet/withdrawal?userType=driver|merchant|customer
 * Get withdrawal status and history
 */
export async function GET(request: NextRequest) {
   try {
      const session = await getSession();

      if (!session?.user) {
         return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
         );
      }

      const { searchParams } = new URL(request.url);
      const userType = searchParams.get('userType');

      if (!userType || !['driver', 'merchant', 'customer'].includes(userType)) {
         return NextResponse.json(
            { success: false, message: "Invalid user type" },
            { status: 400 }
         );
      }

      // Get user with wallet
      const user = await prisma.user.findUnique({
         where: { id: session.user.id },
         select: {
            id: true,
            wallet: {
               select: {
                  id: true,
                  withdrawals: {
                     orderBy: { createdAt: 'desc' },
                     take: 10,
                     include: {
                        transaction: true
                     }
                  }
               }
            },
            merchantManagers: {
               select: {
                  merchant: {
                     select: {
                        wallet: {
                           select: {
                              id: true,
                              withdrawals: {
                                 orderBy: { createdAt: 'desc' },
                                 take: 10,
                                 include: {
                                    transaction: true
                                 }
                              }
                           }
                        }
                     }
                  }
               }
            }
         },
      });

      if (!user) {
         return NextResponse.json(
            { success: false, message: "User not found" },
            { status: 404 }
         );
      }

      // Get the appropriate wallet
      let wallet;
      if (userType === 'merchant' && user.merchantManagers.length > 0) {
         wallet = user.merchantManagers[0].merchant.wallet;
      } else {
         wallet = user.wallet;
      }

      if (!wallet) {
         return NextResponse.json(
            { success: false, message: "Wallet not found" },
            { status: 404 }
         );
      }

      // Get latest withdrawal
      const latestWithdrawal = wallet.withdrawals[0] || null;

      // Calculate stats
      const totalWithdrawals = wallet.withdrawals.length;
      const successfulWithdrawals = wallet.withdrawals.filter(w => w.status === WithdrawalStatus.COMPLETED).length;
      const failedWithdrawals = wallet.withdrawals.filter(w => w.status === WithdrawalStatus.FAILED).length;
      const pendingWithdrawals = wallet.withdrawals.filter(w =>
         w.status === WithdrawalStatus.PENDING || w.status === WithdrawalStatus.INITIALIZATION
      ).length;

      return NextResponse.json({
         success: true,
         data: {
            latestWithdrawal,
            stats: {
               total: totalWithdrawals,
               successful: successfulWithdrawals,
               failed: failedWithdrawals,
               pending: pendingWithdrawals,
            },
            withdrawals: wallet.withdrawals,
         },
      });

   } catch (error) {
      console.error("Error fetching withdrawal data:", error);
      return NextResponse.json(
         {
            success: false,
            message: error instanceof Error ? error.message : "Failed to fetch withdrawal data",
         },
         { status: 500 }
      );
   }
}
