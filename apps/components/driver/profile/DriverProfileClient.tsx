// components/driver/profile/DriverProfileClient.tsx
// Main client component for driver profile

"use client";

import { useState, useEffect } from 'react';
import { User, TrendingUp, Package, Star, LogOut, Trash2, ShoppingBag } from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import DriverProfileStats from './DriverProfileStats';
import DriverDocumentsPreview from './DriverDocumentsPreview';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import ExitDriverModeDialog from './ExitDriverModeDialog';
import { useRouter } from 'next/navigation';
import { User as DbUser } from '@prisma/client';
import { ROUTES } from '@/lib/router';
import { useAuthStore } from '@/hooks/use-auth-store';

interface DriverProfileClientProps {
    driver: DbUser;
}

interface PerformanceStats {
    rating: number;
    totalReviews: number;
    totalDeliveries: number;
    completionRate: number;
    onTimeRate: number;
}

export default function DriverProfileClient({ driver }: DriverProfileClientProps) {
    const t = useT();
    const router = useRouter();
    const { logout } = useAuthStore();
    const [showExitDialog, setShowExitDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        const fetchPerformanceStats = async () => {
            try {
                const response = await fetch('/api/v1/driver/profile/stats');
                const data = await response.json();
                setPerformanceStats(data);
            } catch (error) {
                console.error('Failed to fetch performance stats:', error);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchPerformanceStats();
    }, []);

    const handleLogout = async () => {
        await logout()
        router.push(ROUTES.signIn({ redirect: '/' }));
    };

    const handleDeleteAccount = async () => {
        // Implement delete account logic
        setShowDeleteDialog(false);
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section with Red Gradient */}
            <section className="gradient-hero py-8 sm:py-12 lg:py-16 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-white">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                            <User className="w-8 h-8" />
                            {t('Profile & Settings')}
                        </h1>
                        <p className="mt-1 sm:mt-2 text-sm text-white/90">
                            {t('Manage your account and preferences')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Cards */}
            <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-6">
                <DriverProfileStats driverId={driver.id} />
            </div>

            {/* Main Content */}
            <div className="container mx-auto max-w-7xl px-4 space-y-6 pb-12">
                {/* Personal Information */}
                <Card className="p-6 rounded-2xl shadow-card">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        {t('Personal Information')}
                    </h2>

                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        {/* Profile Photo */}
                        {/* <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
                            {driver.photoUrl ? (
                                <Image
                                    src={driver.photoUrl}
                                    alt={driver.fullName || 'Driver'}
                                    width={96}
                                    height={96}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-12 h-12 text-gray-400" />
                                </div>
                            )}
                        </div> */}

                        {/* Info */}
                        <div className="flex-1 space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">{t('Full Name')}</p>
                                <p className="text-lg font-semibold">{driver.name || t('Not provided')}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('Phone Number')}</p>
                                    <p className="font-medium">{driver.phone || t('Not provided')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('Email')}</p>
                                    <p className="font-medium">{driver.email || t('Not provided')}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('Member Since')}</p>
                                <p className="font-medium">
                                    {driver.createdAt && (new Date(driver.createdAt).toLocaleDateString('en-US', {
                                        month: 'long',
                                        year: 'numeric',
                                    }))}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Documents Preview */}
                <DriverDocumentsPreview driverId={driver.id} />

                {/* Language Preferences */}
                <Card className="p-6 rounded-2xl shadow-card">
                    <h2 className="text-xl font-semibold mb-6">{t('Language Preferences')}</h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">{t('Language')}</p>
                            <p className="text-sm text-muted-foreground">
                                {t('Choose your preferred language')}
                            </p>
                        </div>
                        <LanguageSwitcher />
                    </div>
                </Card>

                {/* Performance Stats */}
                <Card className="p-6 rounded-2xl shadow-card">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        {t('Performance Overview')}
                    </h2>

                    {loadingStats ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                                    <Skeleton className="h-4 w-20 mb-2" />
                                    <Skeleton className="h-8 w-16 mb-1" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            ))}
                        </div>
                    ) : performanceStats ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Star className="w-5 h-5 text-yellow-600" />
                                    <p className="text-sm text-muted-foreground">{t('Rating')}</p>
                                </div>
                                <p className="text-2xl font-bold">{performanceStats.rating.toFixed(1)} ⭐</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {performanceStats.totalReviews} {t('reviews')}
                                </p>
                            </div>

                            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Package className="w-5 h-5 text-blue-600" />
                                    <p className="text-sm text-muted-foreground">{t('Total Deliveries')}</p>
                                </div>
                                <p className="text-2xl font-bold">{performanceStats.totalDeliveries}</p>
                            </div>

                            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                    <p className="text-sm text-muted-foreground">{t('Completion Rate')}</p>
                                </div>
                                <p className="text-2xl font-bold">{performanceStats.completionRate}%</p>
                            </div>

                            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Star className="w-5 h-5 text-purple-600" />
                                    <p className="text-sm text-muted-foreground">{t('On-time Rate')}</p>
                                </div>
                                <p className="text-2xl font-bold">{performanceStats.onTimeRate}%</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">
                            {t('Failed to load performance stats')}
                        </p>
                    )}
                </Card>

                {/* Account Actions */}
                <Card className="p-6 rounded-2xl shadow-card">
                    <h2 className="text-xl font-semibold mb-6">{t('Account Actions')}</h2>

                    <div className="space-y-3">
                        {/* Switch to Client */}
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-2"
                            onClick={() => setShowExitDialog(true)}
                        >
                            <ShoppingBag className="w-4 h-4" />
                            {t('Switch to Customer Mode')}
                        </Button>

                        {/* Logout */}
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-2"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4" />
                            {t('Logout')}
                        </Button>

                        {/* Delete Account */}
                        <Button
                            variant="destructive"
                            className="w-full justify-start gap-2"
                            onClick={() => setShowDeleteDialog(true)}
                        >
                            <Trash2 className="w-4 h-4" />
                            {t('Delete Account')}
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Exit Driver Mode Dialog */}
            <ExitDriverModeDialog
                isOpen={showExitDialog}
                onClose={() => setShowExitDialog(false)}
            />
        </div>
    );
}
