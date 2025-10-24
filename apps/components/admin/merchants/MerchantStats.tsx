import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerT } from "@/i18n/server-translations";
import { Package, ShoppingCart, Clock, Star } from "lucide-react";

interface MerchantStatsProps {
    stats: {
        activeProducts: number;
        totalOrders: number;
        pendingOrders: number;
    };
    merchant: {
        rating?: number | null;
        deliveryTime?: string | null;
    };
}

export async function MerchantStats({ stats, merchant }: MerchantStatsProps) {
    const t = await getServerT();

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("Active Products")}</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.activeProducts}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {stats.activeProducts >= 5
                            ? "Meets minimum requirement"
                            : `Need ${5 - stats.activeProducts} more to verify`}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("Total Orders")}</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalOrders}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {t("All time orders")}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("Pending Orders")}</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div
                        className={`text-2xl font-bold ${stats.pendingOrders > 0 ? "text-orange-600" : ""
                            }`}
                    >
                        {stats.pendingOrders}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {stats.pendingOrders > 0
                            ? "Requires attention"
                            : "No pending orders"}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("Rating")}</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {merchant.rating ? merchant.rating.toFixed(1) : "N/A"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {merchant.deliveryTime || "Standard delivery"}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}