"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Store,
    MapPin,
    Phone,
    Calendar,
    CheckCircle,
    Clock,
    LogOut,
    Building2
} from 'lucide-react';
import { Merchant, MerchantType } from '@prisma/client';
import { useT } from '@/hooks/use-inline-translation';
import { OptimizedImage } from '@/components/ClsOptimization';
import StoresList from './StoresList';
import ExitMerchantModeDialog from './ExitMerchantModeDialog';
import { SlideUp } from './animations/TransitionWrappers';

interface MerchantProfileProps {
    currentMerchant: Merchant;
    allMerchants: Merchant[];
}

const merchantTypeLabels: Record<MerchantType, string> = {
    GROCERY: 'Grocery',
    FOOD: 'Food',
    PHARMACY: 'Pharmacy',
};

export default function MerchantProfile({
    currentMerchant,
    allMerchants,
}: MerchantProfileProps) {
    const t = useT();
    const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);

    return (
        <div className="container mx-auto max-w-7xl">
            {/* Header */}
            <section className="gradient-hero py-8 sm:py-12 lg:py-16 px-4">
                <SlideUp>
                    <div className="container mx-auto max-w-7xl">
                        <div className="text-white flex justify-between items-center">
                            <div className="mb-6">
                                <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
                                    {t('Merchant Profile')}
                                </h1>
                                <p className="mt-1 sm:mt-2 text-sm text-white truncate">
                                    {t('Manage your store information and switch between stores')}
                                </p>
                            </div>

                        </div>
                    </div>
                </SlideUp>
            </section>

            <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-12">
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Current Store Info - Takes 2 columns on large screens */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Store Banner & Logo */}
                        <Card className="overflow-hidden">
                            <div className="relative h-32 sm:h-48 bg-gradient-to-r from-primary/20 to-primary/5">
                                {currentMerchant.bannerUrl && (
                                    <OptimizedImage
                                        src={currentMerchant.bannerUrl}
                                        alt={currentMerchant.businessName}
                                        fill
                                        className="object-cover"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                            </div>

                            <CardContent className="relative -mt-12 sm:-mt-16">
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-background bg-background overflow-hidden shadow-lg">
                                        {currentMerchant.logoUrl ? (
                                            <OptimizedImage
                                                src={currentMerchant.logoUrl}
                                                alt={currentMerchant.businessName}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                                <Store className="w-12 h-12 text-primary" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <h2 className="text-2xl sm:text-3xl font-bold">
                                                {currentMerchant.businessName}
                                            </h2>
                                            {currentMerchant.isVerified ? (
                                                <Badge className="bg-primary hover:bg-primary">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    {t('Verified')}
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {t('Pending Verification')}
                                                </Badge>
                                            )}
                                        </div>
                                        <Badge variant="secondary" className="mt-2">
                                            <Building2 className="w-3 h-3 mr-1" />
                                            {merchantTypeLabels[currentMerchant.merchantType]}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Store Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('Store Information')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">{t('Phone')}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {currentMerchant.phone || t('Not provided')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">{t('Location')}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {currentMerchant.address.latitude.toFixed(4)}, {currentMerchant.address.longitude.toFixed(4)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">{t('Member Since')}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {t.formatDateTime(currentMerchant.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    {currentMerchant.rating && (
                                        <div className="flex items-start gap-3">
                                            <Store className="w-5 h-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium">{t('Rating')}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    ⭐ {currentMerchant.rating.toFixed(1)} / 5.0
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {currentMerchant.deliveryTime && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm font-medium mb-1">{t('Delivery Time')}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {currentMerchant.deliveryTime}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Exit Merchant Mode */}
                        <Card className="border-destructive/50">
                            <CardHeader>
                                <CardTitle className="text-destructive">{t('Exit Merchant Mode')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {t('Return to customer mode to browse and order from stores')}
                                </p>
                                <Button
                                    variant="destructive"
                                    onClick={() => setIsExitDialogOpen(true)}
                                    className="w-full sm:w-auto"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    {t('Switch to Customer Mode')}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* My Stores - Takes 1 column on large screens */}
                    <div className="lg:col-span-1">
                        <StoresList
                            currentMerchantId={currentMerchant.id}
                            merchants={allMerchants}
                        />
                    </div>
                </div>
            </div>

            {/* Exit Dialog */}
            <ExitMerchantModeDialog
                isOpen={isExitDialogOpen}
                onClose={() => setIsExitDialogOpen(false)}
            />
        </div>
    );
}