"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select";
import {
     CheckCircle,
     XCircle,
     Package,
     User,
     Calendar,
     WalletIcon,
     Search,
     Filter,
     TrendingUp,
} from "lucide-react";
import { useT } from "@/hooks/use-inline-translation";
import { OptimizedImage } from "@/components/ClsOptimization";
import type { Order } from "@/types/merchant_types";
import { OrderStatus } from "@prisma/client";
import { useState, useMemo } from "react";
import { getStatusIcon, formatOrderId, getOrderStatusColor } from "@/lib/orders-utils";
import EmptyState from "./animations/EmptyStates";
import { FadeIn, StaggerChildren, StaggerItem } from "./animations/TransitionWrappers";

interface HistoryOrdersProps {
     orders: Order[];
}

export default function HistoryOrders({ orders }: HistoryOrdersProps) {
     const t = useT();
     const [searchQuery, setSearchQuery] = useState("");
     const [statusFilter, setStatusFilter] = useState<string>("all");
     const [sortBy, setSortBy] = useState<"date" | "amount">("date");


     const getStatusCategory = (status: OrderStatus): "completed" | "cancelled" | "rejected" => {
          if (status === OrderStatus.COMPLETED) return "completed";
          if ([OrderStatus.CANCELED_BY_MERCHANT, OrderStatus.CANCELED_BY_DRIVER].some(e => e == status))
               return "cancelled";
          return "rejected";
     };

     const filteredOrders = useMemo(() => {
          let filtered = [...orders];

          if (searchQuery) {
               const query = searchQuery.toLowerCase();
               filtered = filtered.filter(
                    (order) =>
                         order.id.toLowerCase().includes(query) ||
                         order.user.name?.toLowerCase().includes(query)
               );
          }

          if (statusFilter !== "all") {
               filtered = filtered.filter((order) => getStatusCategory(order.status) === statusFilter);
          }

          filtered.sort((a, b) => {
               if (sortBy === "date") {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
               } else {
                    return b.orderPrices.total - a.orderPrices.total;
               }
          });

          return filtered;
     }, [orders, searchQuery, statusFilter, sortBy]);

     const stats = useMemo(() => {
          const completed = orders.filter((o) => o.status === OrderStatus.COMPLETED);
          const cancelled = orders.filter((o) =>
               [OrderStatus.CANCELED_BY_MERCHANT, OrderStatus.CANCELED_BY_DRIVER].some(e => e == o.status)
          );
          const rejected = orders.filter((o) =>
               [OrderStatus.REJECTED_BY_MERCHANT, OrderStatus.REJECTED_BY_DRIVER].some(e => e == o.status)
          );
          const totalRevenue = completed.reduce((sum, o) => sum + o.orderPrices.total, 0);

          return {
               total: orders.length,
               completed: completed.length,
               cancelled: cancelled.length,
               rejected: rejected.length,
               totalRevenue,
          };
     }, [orders]);

     if (orders.length === 0) {
          return <EmptyState type="history" />;
     }

     if (filteredOrders.length === 0) {
          return <EmptyState type="search" />;
     }

     return (
          <div className="space-y-4 sm:space-y-6">
               {/* Statistics Cards */}
               <FadeIn delay={0.1}>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                         <Card className="rounded-xl">
                              <CardContent className="p-3 sm:p-4">
                                   <div className="flex items-center gap-2 mb-1">
                                        <Package className="w-4 h-4 text-blue-600" />
                                        <p className="text-xs text-muted-foreground">{t("Total")}</p>
                                   </div>
                                   <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
                              </CardContent>
                         </Card>

                         <Card className="rounded-xl">
                              <CardContent className="p-3 sm:p-4">
                                   <div className="flex items-center gap-2 mb-1">
                                        <CheckCircle className="w-4 h-4 text-primary/60" />
                                        <p className="text-xs text-muted-foreground">{t("Completed")}</p>
                                   </div>
                                   <p className="text-xl sm:text-2xl font-bold text-primary/60">
                                        {stats.completed}
                                   </p>
                              </CardContent>
                         </Card>

                         <Card className="rounded-xl">
                              <CardContent className="p-3 sm:p-4">
                                   <div className="flex items-center gap-2 mb-1">
                                        <XCircle className="w-4 h-4 text-red-600" />
                                        <p className="text-xs text-muted-foreground">
                                             {t("Cancelled")} / {t("Rejected")}
                                        </p>
                                   </div>
                                   <p className="text-xl sm:text-2xl font-bold text-red-600">
                                        {stats.cancelled + stats.rejected}
                                   </p>
                              </CardContent>
                         </Card>

                         <Card className="rounded-xl">
                              <CardContent className="p-3 sm:p-4">
                                   <div className="flex items-center gap-2 mb-1">
                                        <TrendingUp className="w-4 h-4 text-primary/60" />
                                        <p className="text-xs text-muted-foreground">{t("Revenue")}</p>
                                   </div>
                                   <p className="text-xl sm:text-2xl font-bold text-primary/60">
                                        {t.formatAmount(stats.totalRevenue)}
                                   </p>
                              </CardContent>
                         </Card>
                    </div>
               </FadeIn>
               {/* Filters */}
               <Card className="rounded-xl">
                    <CardContent className="p-4 sm:p-6">
                         <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                              {/* Search */}
                              <div className="relative flex-1">
                                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                   <Input
                                        placeholder={t("Search by order ID or customer...")}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                   />
                              </div>

                              {/* Status Filter */}
                              <Select value={statusFilter} onValueChange={setStatusFilter}>
                                   <SelectTrigger className="w-full sm:w-[180px]">
                                        <Filter className="w-4 h-4 mr-2" />
                                        <SelectValue />
                                   </SelectTrigger>
                                   <SelectContent>
                                        <SelectItem value="all">{t("All Status")}</SelectItem>
                                        <SelectItem value="completed">{t("Completed")}</SelectItem>
                                        <SelectItem value="cancelled">{t("Cancelled")}</SelectItem>
                                        <SelectItem value="rejected">{t("Rejected")}</SelectItem>
                                   </SelectContent>
                              </Select>

                              {/* Sort By */}
                              <Select value={sortBy} onValueChange={(v) => setSortBy(v as "date" | "amount")}>
                                   <SelectTrigger className="w-full sm:w-[150px]">
                                        <SelectValue />
                                   </SelectTrigger>
                                   <SelectContent>
                                        <SelectItem value="date">{t("Sort by Date")}</SelectItem>
                                        <SelectItem value="amount">{t("Sort by Amount")}</SelectItem>
                                   </SelectContent>
                              </Select>
                         </div>

                         {/* Active filters info */}
                         {(searchQuery || statusFilter !== "all") && (
                              <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                                   <span>
                                        {t("Showing")} {filteredOrders.length} {t("of")} {orders.length}{" "}
                                        {t("orders")}
                                   </span>
                                   <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                             setSearchQuery("");
                                             setStatusFilter("all");
                                        }}
                                        className="h-auto p-0 text-primary hover:text-primary/80"
                                   >
                                        {t("Clear filters")}
                                   </Button>
                              </div>
                         )}
                    </CardContent>
               </Card>

               {/* Orders List */}

               {filteredOrders.length === 0 ? (

                    <Card className="p-8 rounded-xl text-center">
                         <Search className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                         <p className="text-muted-foreground">{t("No orders match your filters")}</p>
                    </Card>
               ) : (
                    <StaggerChildren staggerDelay={0.05} className="space-y-4">
                         <div className="space-y-3 sm:space-y-4">
                              {filteredOrders.map((order) => {
                                   const StatusIcon = getStatusIcon(order.status);
                                   const statusCategory = getStatusCategory(order.status);

                                   return (
                                        <StaggerItem key={order.id}>
                                             <Card
                                                  key={order.id}
                                                  className={`rounded-xl sm:rounded-2xl shadow-card ${statusCategory === "completed"
                                                       ? "border-l-4 border-l-green-500"
                                                       : statusCategory === "cancelled"
                                                            ? "border-l-4 border-l-orange-500"
                                                            : "border-l-4 border-l-red-500"
                                                       }`}
                                             >
                                                  <CardContent className="p-4 sm:p-6">
                                                       {/* Header */}
                                                       <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                                                            <div className="flex-1 min-w-0">
                                                                 <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                                      <h3 className="text-base sm:text-lg font-bold">
                                                                           {t("Order")} {formatOrderId(order.id)}
                                                                      </h3>
                                                                      <Badge
                                                                           className={`${getOrderStatusColor(
                                                                                order.status
                                                                           )} text-white text-xs`}
                                                                      >
                                                                           <StatusIcon className="w-3 h-3 mr-1" />
                                                                           {order.status.replace(/_/g, " ")}
                                                                      </Badge>
                                                                 </div>

                                                                 <div className="space-y-1 text-sm text-muted-foreground">
                                                                      <div className="flex items-center gap-2">
                                                                           <User className="w-4 h-4 flex-shrink-0" />
                                                                           <span className="font-medium truncate">
                                                                                {order.user.name}
                                                                           </span>
                                                                      </div>
                                                                      <div className="flex items-center gap-2">
                                                                           <Calendar className="w-4 h-4 flex-shrink-0" />
                                                                           <span>
                                                                                {new Date(order.createdAt).toLocaleDateString(
                                                                                     "en-US",
                                                                                     {
                                                                                          year: "numeric",
                                                                                          month: "short",
                                                                                          day: "numeric",
                                                                                          hour: "2-digit",
                                                                                          minute: "2-digit",
                                                                                     }
                                                                                )}
                                                                           </span>
                                                                      </div>
                                                                 </div>
                                                            </div>

                                                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                                                                 <div className="text-right">
                                                                      <div className="flex items-center gap-1 text-xl sm:text-2xl font-bold">
                                                                           <WalletIcon className="w-5 h-5" />
                                                                           {t.formatAmount(order.orderPrices.total)}
                                                                      </div>
                                                                      <div className="text-xs sm:text-sm text-muted-foreground">
                                                                           {order.items.length} {t("item")}
                                                                           {order.items.length > 1 ? "s" : ""}
                                                                      </div>
                                                                 </div>
                                                            </div>
                                                       </div>

                                                       {/* Items Preview */}
                                                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                                            {order.items.slice(0, 4).map((item) => (
                                                                 <div
                                                                      key={item.id}
                                                                      className="flex items-center gap-2 p-2 bg-muted rounded-lg"
                                                                 >
                                                                      <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-lg overflow-hidden">
                                                                           {item.product.images?.[0] ? (
                                                                                <OptimizedImage
                                                                                     src={item.product.images[0].url}
                                                                                     blurDataURL={
                                                                                          item.product.images[0].blurDataUrl ??
                                                                                          undefined
                                                                                     }
                                                                                     alt={item.product.title}
                                                                                     fill
                                                                                     className="object-cover"
                                                                                />
                                                                           ) : (
                                                                                <div className="w-full h-full bg-muted-foreground/10 flex items-center justify-center">
                                                                                     <Package className="w-5 h-5 text-muted-foreground" />
                                                                                </div>
                                                                           )}
                                                                      </div>
                                                                      <div className="flex-1 min-w-0">
                                                                           <p className="text-xs font-medium truncate">
                                                                                {item.product.title}
                                                                           </p>
                                                                           <p className="text-xs text-muted-foreground">
                                                                                ×{item.quantity}
                                                                           </p>
                                                                      </div>
                                                                 </div>
                                                            ))}
                                                       </div>
                                                  </CardContent>
                                             </Card>
                                        </StaggerItem>
                                   );
                              })}
                         </div>
                    </StaggerChildren>

               )}
          </div>
     );
}