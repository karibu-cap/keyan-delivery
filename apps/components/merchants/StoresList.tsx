
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Merchant, MerchantType } from '@prisma/client';
import { useT } from '@/hooks/use-inline-translation';
import { OptimizedImage } from '@/components/ClsOptimization';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface StoresListProps {
    currentMerchantId: string;
    merchants: Merchant[];
}

const merchantTypeColors: Record<MerchantType, string> = {
    GROCERY: 'bg-primary/10 text-green-800 dark:bg-primary dark:text-primary/30',
    FOOD: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    PHARMACY: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
};

export default function StoresList({ currentMerchantId, merchants }: StoresListProps) {
    const t = useT();

    merchants.sort(((a, b) => {
        const aCurrent = a.id === currentMerchantId;
        const bCurrent = b.id === currentMerchantId;

        if (aCurrent && !bCurrent) return -1;
        if (bCurrent && !aCurrent) return 1;
        return 0
    }))

    return (
        <Card className="h-fit sticky top-20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Store className="w-5 h-5" />
                    {t('My Stores')}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    {merchants.length} {merchants.length === 1 ? t('store') : t('stores')}
                </p>
            </CardHeader>
            <CardContent className="space-y-3">
                {merchants.length === 0 ? (
                    <div className="text-center py-8">
                        <Store className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                        <p className="text-sm text-muted-foreground">{t('No stores found')}</p>
                    </div>
                ) : (
                    merchants.map((merchant) => {
                        const isCurrent = merchant.id === currentMerchantId;

                        return (
                            <div
                                key={merchant.id}
                                className={cn(
                                    "relative rounded-lg border p-3 transition-all hover:shadow-md",
                                    isCurrent
                                        ? "border-primary bg-primary/5 shadow-sm"
                                        : "border-border hover:border-primary/50"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Store Logo */}
                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                        {merchant.logoUrl ? (
                                            <OptimizedImage
                                                src={merchant.logoUrl}
                                                alt={merchant.businessName}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Store className="w-6 h-6 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Store Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="font-semibold text-sm truncate">
                                                {merchant.businessName}
                                            </h3>
                                            {isCurrent && (
                                                <Badge variant="default" className="flex-shrink-0 text-xs">
                                                    {t('Current')}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge
                                                variant="secondary"
                                                className={cn("text-xs", merchantTypeColors[merchant.merchantType])}
                                            >
                                                {merchant.merchantType}
                                            </Badge>
                                            {merchant.isVerified ? (
                                                <div className="flex items-center gap-1 text-primary/60">
                                                    <CheckCircle className="w-3 h-3" />
                                                    <span className="text-xs">{t('Verified')}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-yellow-600">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-xs">{t('Pending')}</span>
                                                </div>
                                            )}
                                        </div>

                                        {!isCurrent && (

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="w-full mt-2 h-8 text-xs"
                                                asChild
                                            >
                                                <Link href={`/merchant/${merchant.id}`}>
                                                    {t('Switch to this store')}
                                                    <ArrowRight className="w-3 h-3 ml-1" />
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
}