import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { formatOrderId, getOrderStatusColor, getStatusIcon } from "@/lib/orders-utils";
import { useT } from "@/hooks/use-inline-translation";
import { OptimizedImage } from "@/components/ClsOptimization";
import type { Order } from "@/types/merchant_types";


interface HistoryOrdersProps {
     orders: Order[];
}

export default function HistoryOrders({ orders }: HistoryOrdersProps) {
     const t = useT()

     if (orders.length === 0) {
          return (
               <Card className="p-12 rounded-2xl shadow-card text-center">
                    <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">{t("No order history")}</h3>
                    <p className="text-muted-foreground">
                         {t("Completed and cancelled orders will appear here")}
                    </p>
               </Card>
          );
     }

     return (
          <>
               {orders.map((order) => {
                    const StatusIcon = getStatusIcon(order.status);

                    return (
                         <Card key={order.id} className="p-6 rounded-2xl shadow-card">
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
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                             <p><strong>{t("Customer")}:</strong> {order.user.fullName}</p>
                                             <p><strong>{t("Completed")}:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                                        </div>
                                   </div>
                                   <div className="text-right">
                                        <div className="text-2xl font-bold">
                                             ${order.orderPrices.total.toFixed(2)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                             {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                        </div>
                                   </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                   {order.items.slice(0, 4).map((item) => (
                                        <div key={item.id} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                                             <div className="relative w-12 h-12">
                                                  <OptimizedImage
                                                       src={item.product.images[0].url}
                                                       blurDataURL={item.product.images[0].blurDataUrl ?? undefined}
                                                       alt={item.product.title}
                                                       fill
                                                       className="rounded-lg object-cover"
                                                  />
                                             </div>
                                             <div className="flex-1 min-w-0">
                                                  <p className="text-xs font-medium truncate">{item.product.title}</p>
                                                  <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                                             </div>
                                        </div>
                                   ))}
                              </div>
                         </Card>
                    );
               })}
          </>
     );
}