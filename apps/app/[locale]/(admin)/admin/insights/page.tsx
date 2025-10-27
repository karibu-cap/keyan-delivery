import { Metadata } from "next";
import {
    getPlatformStats,
    getOrdersByStatus,
    getTopMerchants,
    getTopDrivers,
    getRecentActivities,
    getPopularProducts,
} from "@/lib/actions/server/admin/insights";
import InsightsClient from "@/components/admin/insights/InsightsClient";

export const metadata: Metadata = {
    title: "Insights | Admin Dashboard",
    description: "Platform analytics and insights",
};

export default async function InsightsPage({
    searchParams,
}: {
    searchParams: Promise<{ period?: string }>;
}) {

    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    const params = await searchParams;

    switch (params.period) {
        case "7days":
            startDate.setDate(endDate.getDate() - 7);
            break;
        case "30days":
            startDate.setDate(endDate.getDate() - 30);
            break;
        case "90days":
            startDate.setDate(endDate.getDate() - 90);
            break;
        case "year":
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
        default:
            startDate.setDate(endDate.getDate() - 30);
    }

    const dateRange = { startDate, endDate };

    const [
        platformStats,
        ordersByStatus,
        topMerchants,
        topDrivers,
        recentActivities,
        popularProducts,
    ] = await Promise.all([
        getPlatformStats(dateRange),
        getOrdersByStatus(dateRange),
        getTopMerchants(dateRange, 5),
        getTopDrivers(dateRange, 5),
        getRecentActivities(10),
        getPopularProducts(dateRange, 5),
    ]);

    return (
        <InsightsClient
            platformStats={platformStats}
            ordersByStatus={ordersByStatus}
            topMerchants={topMerchants}
            topDrivers={topDrivers}
            recentActivities={recentActivities}
            popularProducts={popularProducts}
            currentPeriod={params.period || "30days"}
        />
    );
}