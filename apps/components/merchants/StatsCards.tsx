import { Card, CardContent } from "@/components/ui/card";
import { Package, WalletIcon, ShoppingBag, Star } from "lucide-react";
import { getServerT } from "@/i18n/server-translations";

import type { DashboardStats } from "@/types/merchant_types";
import { StaggerChildren, StaggerItem, ScaleIn } from "./animations/TransitionWrappers";

interface StatsCardsProps {
     stats: DashboardStats;
}

export default async function StatsCards({ stats }: StatsCardsProps) {
     const t = await getServerT();

     const cards = [
          {
               title: t("Total Products"),
               value: stats.totalProducts,
               subtitle: `${stats.activeProductsCount} ${t("active")}`,
               icon: Package,
               color: "text-blue-600",
               bgColor: "bg-blue-100 dark:bg-blue-900",
          },
          {
               title: t("Monthly Revenue"),
               value: stats.monthlyRevenue.toLocaleString(),
               subtitle: `${stats.completedOrdersCount} ${t("completed")}`,
               icon: WalletIcon,
               color: "text-primary/60",
               bgColor: "bg-primary/10 dark:bg-primary",
          },
          {
               title: t("Orders Today"),
               value: stats.ordersToday,
               subtitle: `${stats.pendingCount} ${t("pending")}`,
               icon: ShoppingBag,
               color: "text-orange-600",
               bgColor: "bg-orange-100 dark:bg-orange-900",
          },
          {
               title: t("Store Rating"),
               value: stats.storeRating.toFixed(1),
               subtitle: "/ 5.0",
               icon: Star,
               color: "text-yellow-600",
               bgColor: "bg-yellow-100 dark:bg-yellow-900",
          },
     ];

     return (
          <StaggerChildren staggerDelay={0.1} className="space-y-4">
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {cards.map((card, index) => {
                         const Icon = card.icon;
                         return (
                              <StaggerItem key={index}>
                                   <ScaleIn delay={index * 0.05}>
                                        <Card key={index} className="rounded-2xl shadow-card hover:shadow-card-hover transition-shadow">
                                             <CardContent className="p-4 sm:p-6">
                                                  <div className="flex items-start justify-between">
                                                       <div className="flex-1 min-w-0">
                                                            <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 truncate">
                                                                 {card.title}
                                                            </p>
                                                            <div className="flex items-baseline gap-2">
                                                                 <h3 className="text-2xl sm:text-3xl font-bold truncate">
                                                                      {card.value}
                                                                 </h3>
                                                                 <p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                                                                      {card.subtitle}
                                                                 </p>
                                                            </div>
                                                       </div>
                                                       <div className={`p-2 sm:p-3 rounded-lg ${card.bgColor} flex-shrink-0`}>
                                                            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.color}`} />
                                                       </div>
                                                  </div>
                                             </CardContent>
                                        </Card>
                                   </ScaleIn>
                              </StaggerItem>
                         );
                    })}
               </div>
          </StaggerChildren>
     );
}