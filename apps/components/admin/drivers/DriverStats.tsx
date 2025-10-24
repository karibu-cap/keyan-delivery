import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerT } from "@/i18n/server-translations";
import { Package, TrendingUp, DollarSign, Wallet } from "lucide-react";

interface DriverStatsProps {
    stats: {
        totalDeliveries: number;
        activeDeliveries: number;
        totalEarnings: number;
        averagePerDelivery: number;
        walletBalance: number;
    };
    driver: any;
}

export async function DriverStats({ stats, driver }: DriverStatsProps) {
    const t = await getServerT();

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t("Total Deliveries")}
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalDeliveries}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {t("Completed orders")}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t("Active Deliveries")}
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div
                        className={`text-2xl font-bold ${stats.activeDeliveries > 0 ? "text-orange-600" : ""
                            }`}
                    >
                        {stats.activeDeliveries}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {t("In progress")}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t("Total Earnings")}
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                        ${stats.totalEarnings.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {t("Avg {price} per delivery", {
                            price: t.formatAmount(stats.averagePerDelivery),
                        })}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t("Wallet Balance")}
                    </CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {t.formatAmount(stats.walletBalance)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {t("Current balance")}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}