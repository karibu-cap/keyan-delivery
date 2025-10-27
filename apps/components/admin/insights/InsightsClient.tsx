"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingCart,
    Users,
    Package,
    Store,
    Truck,
    Activity,
    Clock,
    CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useT } from "@/hooks/use-inline-translation";

interface InsightsClientProps {
    platformStats: {
        totalOrders: number;
        completedOrders: number;
        revenue: number;
        totalUsers: number;
        totalMerchants: number;
        totalDrivers: number;
        totalProducts: number;
        activeZones: number;
        orderGrowth: number;
        completionRate: number;
    };
    ordersByStatus: Array<{ status: string; count: number }>;
    topMerchants: Array<{ id: string; name: string; orderCount: number; revenue: number }>;
    topDrivers: Array<{ driverId: string; name: string; deliveryCount: number }>;
    recentActivities: Array<{
        type: string;
        id: string;
        description: string;
        createdAt: Date | null;
        amount?: number;
        status?: string;
    }>;
    popularProducts: Array<{
        productId: string;
        title: string;
        price: number;
        totalQuantity: number;
        revenue: number;
    }>;
    currentPeriod: string;
}

export default function InsightsClient({
    platformStats,
    ordersByStatus,
    topMerchants,
    topDrivers,
    recentActivities,
    popularProducts,
    currentPeriod,
}: InsightsClientProps) {
    const t = useT();
    const router = useRouter();

    const handlePeriodChange = (period: string) => {
        router.push(`/admin/insights?period=${period}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return "bg-green-500/10 text-green-700 border-green-500/20";
            case "PENDING":
                return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
            case "CANCELED_BY_MERCHANT":
            case "CANCELED_BY_DRIVER":
            case "REJECTED_BY_MERCHANT":
            case "REJECTED_BY_DRIVER":
                return "bg-red-500/10 text-red-700 border-red-500/20";
            default:
                return "bg-blue-500/10 text-blue-700 border-blue-500/20";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("Insights & Analytics")}</h1>
                    <p className="text-muted-foreground">{t("Platform performance and key metrics")}</p>
                </div>
                <Select value={currentPeriod} onValueChange={handlePeriodChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7days">{t("Last 7 days")}</SelectItem>
                        <SelectItem value="30days">{t("Last 30 days")}</SelectItem>
                        <SelectItem value="90days">{t("Last 90 days")}</SelectItem>
                        <SelectItem value="year">{t("Last year")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Main Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            {t("Total Revenue")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{t.formatAmount(platformStats.revenue)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {platformStats.completedOrders} {t("completed orders")}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            {t("Total Orders")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{platformStats.totalOrders}</div>
                        <div className="flex items-center gap-1 text-xs mt-1">
                            {platformStats.orderGrowth > 0 ? (
                                <>
                                    <TrendingUp className="h-3 w-3 text-primary" />
                                    <span className="text-primary">
                                        +{platformStats.orderGrowth.toFixed(1)}%
                                    </span>
                                </>
                            ) : (
                                <>
                                    <TrendingDown className="h-3 w-3 text-red-600" />
                                    <span className="text-red-600">
                                        {platformStats.orderGrowth.toFixed(1)}%
                                    </span>
                                </>
                            )}
                            <span className="text-muted-foreground">{t("vs previous period")}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            {t("Completion Rate")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {platformStats.completionRate.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {platformStats.completedOrders} / {platformStats.totalOrders} {t("orders")}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {t("Active Users")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{platformStats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {platformStats.totalDrivers} {t("drivers")}, {platformStats.totalMerchants}{" "}
                            {t("merchants")}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Orders by Status & Top Performers */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Orders by Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            {t("Orders by Status")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {ordersByStatus.map((item) => (
                                <div key={item.status} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={getStatusColor(item.status)}>
                                            {item.status}
                                        </Badge>
                                    </div>
                                    <span className="font-semibold">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Merchants */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Store className="h-5 w-5" />
                            {t("Top Merchants")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {topMerchants.map((merchant, index) => (
                                <div key={merchant.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            #{index + 1}
                                        </span>
                                        <span className="font-medium">{merchant.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{t.formatAmount(merchant.revenue)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {merchant.orderCount} {t("orders")}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Drivers & Popular Products */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Top Drivers */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            {t("Top Drivers")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {topDrivers.map((driver, index) => (
                                <div key={driver.driverId} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            #{index + 1}
                                        </span>
                                        <span className="font-medium">{driver.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">
                                            {driver.deliveryCount} {t("deliveries")}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            {t("Popular Products")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {popularProducts.map((product, index) => (
                                <div key={product.productId} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            #{index + 1}
                                        </span>
                                        <span className="font-medium truncate">{product.title}</span>
                                    </div>
                                    <div className="text-right ml-2">
                                        <p className="font-semibold">{t.formatAmount(product.revenue)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {product.totalQuantity} {t("sold")}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        {t("Recent Activities")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentActivities.map((activity) => (
                            <div
                                key={`${activity.type}-${activity.id}`}
                                className="flex items-start gap-3 pb-3 border-b last:border-0"
                            >
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    {activity.type === "order" && <ShoppingCart className="h-4 w-4" />}
                                    {activity.type === "user" && <Users className="h-4 w-4" />}
                                    {activity.type === "product" && <Package className="h-4 w-4" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm">{activity.description}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-xs text-muted-foreground">
                                            {t.formatDateTime(activity.createdAt ?? new Date(), true)}
                                        </p>
                                        {activity.status && (
                                            <Badge variant="outline" className={getStatusColor(activity.status)}>
                                                {activity.status}
                                            </Badge>
                                        )}
                                        {activity.amount && (
                                            <span className="text-xs font-semibold">
                                                {t.formatAmount(activity.amount)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}