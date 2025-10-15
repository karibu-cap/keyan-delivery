import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
     Package,
     CheckCircle,
     AlertCircle,
     XCircle
} from "lucide-react";
import { getOrderStatusColor, getStatusIcon, getNextStatus, canReject, canCancel, formatOrderId } from "@/lib/orders-utils";
import { useT } from "@/hooks/use-inline-translation";
import Image from "next/image";
import type { Order } from "@/types/merchant_types";
import { OrderStatus } from "@prisma/client";

interface ActiveOrdersProps {
     orders: Order[];
     onStatusUpdate: (orderId: string, newStatus: OrderStatus) => Promise<void>;
     isUpdating: boolean;
}

export default function ActiveOrders({
     orders,
     onStatusUpdate,
     isUpdating
}: ActiveOrdersProps) {
     const t = useT()
     /// add the pending order on top
     orders.sort((a, b) => {
          if (a.status === OrderStatus.PENDING) return -1;
          if (b.status === OrderStatus.PENDING) return 1;
          return 0;
     });

     if (orders.length === 0) {
          return (
               <Card className="p-12 rounded-2xl shadow-card text-center">
                    <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">{t("No active orders")}</h3>
                    <p className="text-muted-foreground">
                         {t("New orders will appear here")}
                    </p>
               </Card>
          );
     }

     return (
          <>
               {orders.map((order) => {
                    const StatusIcon = getStatusIcon(order.status);
                    const isPending = order.status === OrderStatus.PENDING;
                    const nextStatus = getNextStatus(order.status);

                    return (
                         <Card
                              key={order.id}
                              className={`p-6 rounded-2xl shadow-card transition-all ${isPending ? 'ring-2 bg-orange-100 ring-offset-2 animate-pulse' : ''
                                   }`}
                         >
                              <div className="flex items-start justify-between mb-4">
                                   <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                             <h3 className="text-lg font-semibold">
                                                  {t("Order")} {formatOrderId(order.id)}
                                             </h3>
                                             <Badge className={`${getOrderStatusColor(order.status)} text-white`}>
                                                  <StatusIcon className="w-3 h-3 mr-1" />
                                                  {order.status.replace(/_/g, ' ')}
                                             </Badge>
                                             {isPending && (
                                                  <Badge variant="destructive" className="animate-pulse">
                                                       <AlertCircle className="w-3 h-3 mr-1" />
                                                       {t("Action Required")}
                                                  </Badge>
                                             )}
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                             <p><strong>{t("Customer")}:</strong> {order.user.fullName} - {order.user.phone}</p>
                                             <p><strong>{t("Address")}:</strong> {order.deliveryInfo.address}</p>
                                             <p><strong>{t("Contact")}:</strong> {order.deliveryInfo.deliveryContact}</p>
                                             <p><strong>{t("Order Time")}:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                                             {order.pickupCode && (
                                                  <p>
                                                       <strong>{t("Pickup Code")}:</strong>
                                                       <span className="ml-2 font-mono text-lg text-primary">
                                                            {order.pickupCode}
                                                       </span>
                                                  </p>
                                             )}
                                        </div>
                                   </div>
                                   <div className="text-right">
                                        <div className="text-2xl font-bold text-primary">
                                             ${order.orderPrices.total.toFixed(2)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                             {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                        </div>
                                   </div>
                              </div>

                              <div className="space-y-2 mb-4">
                                   {order.items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                             <div className="relative w-12 h-12">
                                                  <Image
                                                       src={item.product.images[0].url}
                                                       blurDataURL={item.product.images[0].blurDataUrl ?? undefined}
                                                       alt={item.product.title}
                                                       fill
                                                       className="rounded-lg object-cover"
                                                  />
                                             </div>

                                             <div className="flex-1">
                                                  <p className="font-medium">{item.product.title}</p>
                                                  <p className="text-sm text-muted-foreground">
                                                       Qty: {item.quantity} × ${item.price.toFixed(2)}
                                                  </p>
                                             </div>
                                             <div className="font-semibold">
                                                  ${(item.quantity * item.price).toFixed(2)}
                                             </div>
                                        </div>
                                   ))}
                              </div>

                              <div className="flex gap-2 pt-4 border-t">
                                   {nextStatus && (
                                        <Button
                                             onClick={() => onStatusUpdate(order.id, nextStatus)}
                                             className="flex-1"
                                             disabled={isUpdating}
                                        >
                                             <CheckCircle className="w-4 h-4 mr-2" />
                                             {nextStatus === OrderStatus.ACCEPTED_BY_MERCHANT && 'Accept Order'}
                                             {nextStatus === OrderStatus.IN_PREPARATION && 'Start Preparation'}
                                             {nextStatus === OrderStatus.READY_TO_DELIVER && 'Mark Ready for Pickup'}
                                        </Button>
                                   )}

                                   {canReject(order.status) && (
                                        <Button
                                             variant="destructive"
                                             onClick={() => onStatusUpdate(order.id, OrderStatus.REJECTED_BY_MERCHANT)}
                                             disabled={isUpdating}
                                        >
                                             <XCircle className="w-4 h-4 mr-2" />
                                             {t("Reject")}
                                        </Button>
                                   )}

                                   {canCancel(order.status) && (
                                        <Button
                                             variant="outline"
                                             onClick={() => onStatusUpdate(order.id, OrderStatus.CANCELED_BY_MERCHANT)}
                                             disabled={isUpdating}
                                        >
                                             <XCircle className="w-4 h-4 mr-2" />
                                             {t("Cancel")}
                                        </Button>
                                   )}
                              </div>
                         </Card>
                    );
               })}
          </>
     );
}