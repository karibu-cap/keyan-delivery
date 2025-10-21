"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
     Package,
     CheckCircle,
     AlertCircle,
     XCircle,
     Loader2,
     Phone,
     MessageCircle,
     Clock,
     MapPin,
     User,
} from "lucide-react";
import { useT } from "@/hooks/use-inline-translation";
import type { Order } from "@/types/merchant_types";
import { OrderStatus } from "@prisma/client";
import { OptimizedImage } from "@/components/ClsOptimization";
import { useState } from "react";
import { getStatusIcon, getNextStatus, getOrderStatusColor, canReject, canCancel } from "@/lib/orders-utils";
import EmptyState from "./animations/EmptyStates";
import { HoverScale, Pulse, StaggerChildren, StaggerItem } from "./animations/TransitionWrappers";

interface ActiveOrdersProps {
     orders: Order[];
     onStatusUpdate: (orderId: string, newStatus: OrderStatus) => Promise<void>;
     isUpdating: boolean;
}

const formatOrderId = (id: string): string => {
     return `#${id.slice(0, 8).toUpperCase()}`;
};

const formatPhoneNumber = (phone: string): string => {
     // Format: (237) 6XX XXX XXX
     const cleaned = phone.replace(/\D/g, '');
     if (cleaned.length >= 9) {
          const country = cleaned.slice(0, 3);
          const part1 = cleaned.slice(3, 4);
          const part2 = cleaned.slice(4, 6);
          const part3 = cleaned.slice(6, 9);
          const part4 = cleaned.slice(9, 12);
          return `(${country}) ${part1}${part2} ${part3} ${part4}`.trim();
     }
     return phone;
};

const formatPhoneForCall = (phone: string): string => {
     return `tel:${phone.replace(/\D/g, '')}`;
};

const formatPhoneForWhatsApp = (phone: string): string => {
     const cleaned = phone.replace(/\D/g, '');
     const number = cleaned.startsWith('237') ? cleaned : `237${cleaned}`;
     return `https://wa.me/${number}`;
};

export default function ActiveOrders({
     orders,
     onStatusUpdate,
     isUpdating,
}: ActiveOrdersProps) {
     const t = useT();
     const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

     // Sort orders: PENDING first, then by most recent update
     const sortedOrders = [...orders].sort((a, b) => {
          const aPending = a.status === OrderStatus.PENDING;
          const bPending = b.status === OrderStatus.PENDING;

          if (aPending && !bPending) return -1;
          if (bPending && !aPending) return 1;

          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
     });

     const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
          setUpdatingOrderId(orderId);
          try {
               await onStatusUpdate(orderId, newStatus);
          } finally {
               setUpdatingOrderId(null);
          }
     };

     if (sortedOrders.length === 0) {
          return (
               <EmptyState
                    type="orders"
                    title={t("No active orders")}
                    description={t("New orders will appear here")}
               />
          );
     }

     return (

          <StaggerChildren staggerDelay={0.05} className="space-y-4" >
               {sortedOrders.map((order) => {
                    const StatusIcon = getStatusIcon(order.status);
                    const isPending = order.status === OrderStatus.PENDING;
                    const nextStatus = getNextStatus(order.status);
                    const isThisOrderUpdating = updatingOrderId === order.id || isUpdating;

                    return (
                         <StaggerItem key={order.id}>
                              <HoverScale scale={1.02}>
                                   <div
                                        key={order.id}
                                        className={`relative rounded-xl sm:rounded-2xl ${isPending ? "ring-2 ring-orange-200 ring-offset-2" : ""
                                             }`}
                                   >
                                        <Card
                                             className={`rounded-xl sm:rounded-2xl shadow-card ${isPending ? "bg-orange-50/50 dark:bg-orange-950/20" : ""
                                                  }`}
                                        >
                                             <CardContent className="p-4 sm:p-6">
                                                  {/* Header Section */}
                                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                                                       <div className="flex-1 min-w-0">
                                                            {/* Order ID & Status */}
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
                                                                 {isPending && (
                                                                      <Pulse>
                                                                           <Badge
                                                                                variant="destructive"
                                                                                className="animate-pulse text-xs"
                                                                           >
                                                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                                                {t("Action Required")}
                                                                           </Badge>
                                                                      </Pulse>
                                                                 )}
                                                            </div>

                                                            {/* Customer Info */}
                                                            <div className="space-y-1.5">
                                                                 <div className="flex items-center gap-2 text-sm">
                                                                      <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                                      <span className="font-medium truncate">
                                                                           {order.user.fullName}
                                                                      </span>
                                                                 </div>

                                                                 {/* Phone with Call & WhatsApp */}
                                                                 {order.user.phone && (
                                                                      <div className="flex items-center gap-2 flex-wrap">
                                                                           <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                                           <span className="text-sm text-muted-foreground">
                                                                                {formatPhoneNumber(order.user.phone)}
                                                                           </span>
                                                                           <div className="flex items-center gap-1.5">
                                                                                <a
                                                                                     href={formatPhoneForCall(order.user.phone)}
                                                                                     className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 hover:bg-primary/20 dark:bg-primary dark:hover:bg-primary text-primary/70 dark:text-primary/30 transition-colors text-xs"
                                                                                     title={t("Call")}
                                                                                >
                                                                                     <Phone className="w-3 h-3" />
                                                                                     <span className="hidden sm:inline">{t("Call")}</span>
                                                                                </a>
                                                                                <a
                                                                                     href={formatPhoneForWhatsApp(order.user.phone)}
                                                                                     target="_blank"
                                                                                     rel="noopener noreferrer"
                                                                                     className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary hover:bg-primary text-white transition-colors text-xs"
                                                                                     title="WhatsApp"
                                                                                >
                                                                                     <MessageCircle className="w-3 h-3" />
                                                                                     <span className="hidden sm:inline">WhatsApp</span>
                                                                                </a>
                                                                           </div>
                                                                      </div>
                                                                 )}

                                                                 {/* Delivery Address */}
                                                                 {order.deliveryInfo?.address && (
                                                                      <div className="flex items-start gap-2 text-sm">
                                                                           <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                                           <span className="text-muted-foreground line-clamp-2">
                                                                                {order.deliveryInfo.address}
                                                                           </span>
                                                                      </div>
                                                                 )}
                                                            </div>
                                                       </div>

                                                       {/* Price & Items Count */}
                                                       <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-1">
                                                            <div className="text-right">
                                                                 <div className="text-xl sm:text-2xl font-bold">
                                                                      {t.formatAmount(order.orderPrices.total)}
                                                                 </div>
                                                                 <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                                                                      {order.items.length} {t("item")}
                                                                      {order.items.length > 1 ? "s" : ""}
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  </div>

                                                  {/* Order Items Grid */}
                                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4">
                                                       {order.items.slice(0, 4).map((item) => (
                                                            <div
                                                                 key={item.id}
                                                                 className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-muted rounded-lg"
                                                            >
                                                                 <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-lg overflow-hidden">
                                                                      {item.product.images?.[0] ? (
                                                                           <OptimizedImage
                                                                                src={item.product.images[0].url}
                                                                                blurDataURL={
                                                                                     item.product.images[0].blurDataUrl ?? undefined
                                                                                }
                                                                                alt={item.product.title}
                                                                                fill
                                                                                className="object-cover"
                                                                           />
                                                                      ) : (
                                                                           <div className="w-full h-full bg-muted-foreground/10 flex items-center justify-center">
                                                                                <Package className="w-6 h-6 text-muted-foreground" />
                                                                           </div>
                                                                      )}
                                                                 </div>
                                                                 <div className="flex-1 min-w-0">
                                                                      <p className="text-xs sm:text-sm font-medium truncate">
                                                                           {item.product.title}
                                                                      </p>
                                                                      <p className="text-xs text-muted-foreground">
                                                                           ×{item.quantity} • ${item.price.toFixed(2)}
                                                                      </p>
                                                                 </div>
                                                            </div>
                                                       ))}
                                                  </div>

                                                  {/* Additional Info */}
                                                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-4 pb-4 border-b">
                                                       <div className="flex items-center gap-1.5">
                                                            <Clock className="w-4 h-4 flex-shrink-0" />
                                                            <span className="truncate">
                                                                 {t("Order Time")}:{" "}
                                                                 {t.formatDateTime(new Date(order.createdAt), true)}
                                                            </span>
                                                       </div>
                                                       {order.pickupCode && (
                                                            <div className="flex items-center gap-1.5">
                                                                 <Package className="w-4 h-4 flex-shrink-0" />
                                                                 <span>
                                                                      {t("Pickup Code")}:{" "}
                                                                      <strong className="font-mono text-primary">
                                                                           {order.pickupCode}
                                                                      </strong>
                                                                 </span>
                                                            </div>
                                                       )}
                                                  </div>

                                                  {/* Action Buttons */}
                                                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                                       {nextStatus && (
                                                            <Button
                                                                 onClick={() => handleStatusUpdate(order.id, nextStatus)}
                                                                 disabled={isThisOrderUpdating}
                                                                 className="w-full sm:flex-1 bg-primary hover:bg-primary"
                                                            >
                                                                 {isThisOrderUpdating ? (
                                                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                 ) : (
                                                                      <CheckCircle className="w-4 h-4 mr-2" />
                                                                 )}
                                                                 {nextStatus === OrderStatus.ACCEPTED_BY_MERCHANT &&
                                                                      t("Accept Order")}
                                                                 {nextStatus === OrderStatus.IN_PREPARATION &&
                                                                      t("Start Preparation")}
                                                                 {nextStatus === OrderStatus.READY_TO_DELIVER &&
                                                                      t("Mark Ready")}
                                                            </Button>
                                                       )}

                                                       {canReject(order.status) && (
                                                            <Button
                                                                 variant="destructive"
                                                                 onClick={() =>
                                                                      handleStatusUpdate(
                                                                           order.id,
                                                                           OrderStatus.REJECTED_BY_MERCHANT
                                                                      )
                                                                 }
                                                                 disabled={isThisOrderUpdating}
                                                                 className="w-full sm:flex-1"
                                                            >
                                                                 {isThisOrderUpdating ? (
                                                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                 ) : (
                                                                      <XCircle className="w-4 h-4 mr-2" />
                                                                 )}
                                                                 {t("Reject")}
                                                            </Button>
                                                       )}

                                                       {canCancel(order.status) && (
                                                            <Button
                                                                 variant="outline"
                                                                 onClick={() =>
                                                                      handleStatusUpdate(
                                                                           order.id,
                                                                           OrderStatus.CANCELED_BY_MERCHANT
                                                                      )
                                                                 }
                                                                 disabled={isThisOrderUpdating}
                                                                 className="w-full sm:w-auto"
                                                            >
                                                                 {isThisOrderUpdating ? (
                                                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                 ) : (
                                                                      <XCircle className="w-4 h-4 mr-2" />
                                                                 )}
                                                                 {t("Cancel")}
                                                            </Button>
                                                       )}
                                                  </div>
                                             </CardContent>
                                        </Card>
                                   </div>
                              </HoverScale>
                         </StaggerItem>
                    );
               })}
          </StaggerChildren>
     );
}