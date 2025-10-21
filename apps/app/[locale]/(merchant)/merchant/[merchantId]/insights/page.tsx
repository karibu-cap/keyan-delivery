// app/(protected)/merchant/insights/page.tsx

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Calendar, TrendingUp, Users } from 'lucide-react';
import { getT } from '@/i18n/server-translations';
import { getUserTokens } from '@/lib/firebase-client/server-firebase-utils';
import { getLocale } from 'next-intl/server';
import type { MerchantAnalytics } from '@/types/merchant_analytics';
import OrdersOverview from '@/components/merchants/insights/OrdersOverview';
import RevenueChart from '@/components/merchants/insights/RevenueChart';
import TopProducts from '@/components/merchants/insights/TopProducts';
import { getMerchantAnalytics } from '@/lib/actions/server/merchants';
import StatsCards from '@/components/merchants/insights/StatsCards';
import { SlideUp } from '@/components/merchants/animations/TransitionWrappers';

export const metadata = {
    title: 'Insights & Analytics | Merchant Dashboard',
    description: 'Analysez les performances de votre commerce',
};

async function getMerchantByUser(authId: string) {
    const userMerchant = await prisma.userMerchantManager.findFirst({
        where: {
            user: {
                authId,
            },
        },
        include: {
            merchant: true,
        },
    });

    return userMerchant;
}

export default async function MerchantInsightsPage() {
    const local = await getLocale()
    const t = await getT(local);
    const tokens = await getUserTokens();
    const authId = tokens?.decodedToken.uid;
    if (!authId) {
        redirect('/sign-in');
    }

    const userMerchant = await getMerchantByUser(authId);

    if (!userMerchant) {
        redirect('/merchant/new-merchant');
    }

    const analytics: MerchantAnalytics = await getMerchantAnalytics(userMerchant.merchantId, 30);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl">
                {/* Header Section - Responsive */}
                <section className="gradient-hero py-8 sm:py-12 lg:py-16 px-4">
                    <SlideUp>
                        <div className="container mx-auto max-w-7xl">
                            <div className="text-white flex justify-between items-center">
                                {/* Header Title */}
                                <div className="mb-6">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
                                        {t('Insights & Analytics')}
                                    </h1>
                                    <p className="mt-1 sm:mt-2 text-sm text-white truncate">
                                        {userMerchant.merchant.businessName}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 sm:px-4 shadow-sm ring-1 ring-gray-200 w-fit">
                                    <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                    <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                                        {t('Last 30 days')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </SlideUp>
                </section>
                <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-12">
                    <StatsCards stats={analytics.stats} />
                </div>
                {/* Charts Grid - Responsive */}
                <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 lg:grid-cols-2">
                    <RevenueChart data={analytics.dailyData} />
                    <OrdersOverview breakdown={analytics.orderStatusBreakdown} />
                </div>

                {/* Additional Insights - Responsive */}
                <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 lg:grid-cols-3">
                    {/* Clients Card */}
                    <div className="rounded-xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-gray-200">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-full bg-purple-100 p-2 flex-shrink-0">
                                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                                {t('Clients')}
                            </h3>
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{t('Total')}</span>
                                <span className="font-semibold text-gray-900">
                                    {analytics.customerInsights.totalCustomers}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{t('New')}</span>
                                <span className="font-semibold text-primary/60">
                                    {analytics.customerInsights.newCustomers}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{t('Returning')}</span>
                                <span className="font-semibold text-blue-600">
                                    {analytics.customerInsights.returningCustomers}
                                </span>
                            </div>
                            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                                <p className="text-xs sm:text-sm text-gray-600">
                                    {t('Average orders per customer')}
                                </p>
                                <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1">
                                    {analytics.customerInsights.averageOrdersPerCustomer.toFixed(1)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Global Performance Card */}
                    <div className="rounded-xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-gray-200 lg:col-span-1">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary/60" />
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                                {t('Global performance')}
                            </h3>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                            <div>
                                <div className="mb-1 flex items-center justify-between text-sm">
                                    <span className="text-gray-600">{t('Completion rate')}</span>
                                    <span className="font-semibold text-primary/60">
                                        {analytics.stats.completionRate.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                    <div
                                        className="h-full rounded-full bg-primary"
                                        style={{ width: `${analytics.stats.completionRate}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="mb-1 flex items-center justify-between text-sm">
                                    <span className="text-gray-600">{t('Cancellation rate')}</span>
                                    <span className="font-semibold text-red-600">
                                        {analytics.stats.cancelRate.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                    <div
                                        className="h-full rounded-full bg-red-600"
                                        style={{ width: `${analytics.stats.cancelRate}%` }}
                                    />
                                </div>
                            </div>
                            <div className="mt-3 sm:mt-4 rounded-lg bg-blue-50 p-2 sm:p-3">
                                <p className="text-xs sm:text-sm text-blue-800">
                                    <span className="font-semibold">
                                        {analytics.orderStatusBreakdown.pending}
                                    </span>{' '}
                                    {t("pending orders")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Products Section */}
                <div className="mt-6 sm:mt-8">
                    <TopProducts products={analytics.topProducts} />
                </div>
            </div>
        </div>
    );
}

