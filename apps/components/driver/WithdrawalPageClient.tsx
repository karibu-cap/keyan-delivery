// File: /components/driver/WithdrawalPageClient.tsx
// Client component for withdrawal page

"use client";

import { WithdrawalForm } from '@/components/driver/WithdrawalForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/router';

interface WithdrawalPageClientProps {
    balance: number;
}

export default function WithdrawalPageClient({ balance }: WithdrawalPageClientProps) {
    const router = useRouter();

    return (
        <div className="min-h-screen">
            {/* Hero Section with Red Gradient */}
            <section className="gradient-hero py-8 sm:py-12 lg:py-16 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-white">
                        {/* Back Button */}
                        <Link href={ROUTES.driverWallet}>
                            <Button 
                                variant="ghost" 
                                className="text-white hover:bg-white/10 mb-4"
                                size="sm"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Wallet
                            </Button>
                        </Link>

                        {/* Header Title */}
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
                                Withdraw Funds
                            </h1>
                            <p className="mt-1 sm:mt-2 text-sm text-white/90 truncate">
                                Request withdrawal to your MTN Mobile Money account
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Withdrawal Form */}
            <div className="container mx-auto max-w-2xl px-4 -mt-8 pb-12">
                <WithdrawalForm 
                    availableBalance={balance}
                    onSuccess={() => {
                        // Redirect back to wallet page after successful withdrawal
                        router.push(ROUTES.driverWallet);
                    }}
                />
            </div>
        </div>
    );
}
