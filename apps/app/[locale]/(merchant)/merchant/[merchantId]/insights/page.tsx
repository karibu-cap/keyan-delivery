// app/(protected)/merchant/insights/page.tsx

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Calendar, TrendingUp, Users, Clock } from 'lucide-react';
import { getT } from '@/i18n/server-translations';
import { getUserTokens } from '@/lib/firebase-client/server-firebase-utils';
import { getLocale } from 'next-intl/server';
import type { MerchantAnalytics } from '@/types/merchant_analytics';
import OrdersOverview from '@/components/merchants/insights/OrdersOverview';
import RevenueChart from '@/components/merchants/insights/RevenueChart';
import TopProducts from '@/components/merchants/insights/TopProducts';
import { getMerchantAnalytics } from '@/lib/actions/server/merchants';
import StatsCards from '@/components/merchants/insights/StatsCards';

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
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                                {t('Insights & Analytics')}
                            </h1>
                            <p className="mt-2 text-sm text-gray-600">
                                {userMerchant.merchant.businessName}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm ring-1 ring-gray-200">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">
                                {t('Last 30 days')}
                            </span>
                        </div>
                    </div>
                </div>

                <StatsCards stats={analytics.stats} />

                <div className="mt-8 grid gap-6 lg:grid-cols-2">
                    <RevenueChart data={analytics.dailyData} />
                    <OrdersOverview breakdown={analytics.orderStatusBreakdown} />
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-3">
                    {/* Insights clients */}
                    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-full bg-purple-100 p-2">
                                <Users className="h-5 w-5 text-purple-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">{t('Clients')}</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{t('Total')}</span>
                                <span className="font-semibold text-gray-900">
                                    {analytics.customerInsights.totalCustomers}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{t('New')}</span>
                                <span className="font-semibold text-primary/60">
                                    {analytics.customerInsights.newCustomers}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{t('Returning')}</span>
                                <span className="font-semibold text-blue-600">
                                    {analytics.customerInsights.returningCustomers}
                                </span>
                            </div>
                            <div className="mt-4 border-t border-gray-200 pt-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">{t('Average orders per customer')}</span>
                                    <span className="font-semibold text-gray-900">
                                        {analytics.customerInsights.averageOrdersPerCustomer.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-full bg-orange-100 p-2">
                                <Clock className="h-5 w-5 text-orange-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">{t('Peak hours')}</h3>
                        </div>
                        <div className="space-y-2">
                            {analytics.peakHours.slice(0, 5).map((peak, index) => (
                                <div
                                    key={peak.hour}
                                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                                            {index + 1}
                                        </span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {peak.hour}:00 - {peak.hour + 1}:00
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">
                                        {peak.orders} cmd
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-full bg-primary/10 p-2">
                                <TrendingUp className="h-5 w-5 text-primary/60" />
                            </div>
                            <h3 className="font-semibold text-gray-900">{t("Global performance")}</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <div className="mb-1 flex items-center justify-between">
                                    <span className="text-sm text-gray-600">{t("Completion rate")}</span>
                                    <span className="text-sm font-semibold text-primary/60">
                                        {analytics.stats.completionRate.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                    <div
                                        className="h-full rounded-full bg-primary/60"
                                        style={{ width: `${analytics.stats.completionRate}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="mb-1 flex items-center justify-between">
                                    <span className="text-sm text-gray-600">{t("Cancellation rate")}</span>
                                    <span className="text-sm font-semibold text-red-600">
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
                            <div className="mt-4 rounded-lg bg-blue-50 p-3">
                                <p className="text-xs text-blue-800">
                                    <span className="font-semibold">
                                        {analytics.orderStatusBreakdown.pending}
                                    </span>{' '}
                                    {t("pending orders")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <TopProducts products={analytics.topProducts} />
                </div>
            </div>
        </div>
    );
}

