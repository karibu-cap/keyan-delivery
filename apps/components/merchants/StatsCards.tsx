import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, DollarSign, TrendingUp, Store } from "lucide-react";
import { getT } from "@/lib/server-translations";
import { getLocale } from "next-intl/server";
import type { DashboardStats } from "@/types/merchant_types";

interface StatsCardsProps {
     stats: DashboardStats;
}

export default async function StatsCards({ stats }: StatsCardsProps) {
     const local = await getLocale()
     const t = await getT(local)

     const statCards = [
          {
               label: t("Total Products"),
               value: stats.totalProducts.toString(),
               icon: Package,
               change: `${stats.activeProductsCount} ${t("active")}`
          },
          {
               label: t("Monthly Revenue"),
               value: `$${stats.monthlyRevenue.toFixed(2)}`,
               icon: DollarSign,
               change: `${stats.completedOrdersCount} ${t("completed")}`
          },
          {
               label: t("Orders Today"),
               value: stats.ordersToday.toString(),
               icon: TrendingUp,
               change: `${stats.pendingCount} ${t("pending")}`
          },
          {
               label: t("Store Rating"),
               value: stats.storeRating.toString(),
               icon: Store,
               change: "★"
          },
     ];

     return (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
               {statCards.map((stat, index) => (
                    <Card
                         key={stat.label}
                         className="p-6 rounded-2xl shadow-card animate-slide-up"
                         style={{ animationDelay: `${index * 50}ms` }}
                    >
                         <div className="flex items-start justify-between mb-4">
                              <div className="w-12 h-12 rounded-2xl gradient-hero flex items-center justify-center">
                                   <stat.icon className="w-6 h-6 text-white" />
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                   {stat.change}
                              </Badge>
                         </div>
                         <div className="text-3xl font-bold mb-1">{stat.value}</div>
                         <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </Card>
               ))}
          </div>
     );
}