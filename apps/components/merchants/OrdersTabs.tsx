"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ActiveOrders from "./ActiveOrders";
import HistoryOrders from "./HistoryOrders";
import { useT } from "@/hooks/use-inline-translation";
import type { Order } from "@/types/merchant_types";
import { ShoppingBag, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateOrderStatus } from "@/lib/actions/merchants";
import type { OrderStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface OrdersTabsProps {
     activeOrders: Order[];
     historyOrders: Order[];
     pendingCount: number;
     merchantId: string;
}

export default function OrdersTabs({
     activeOrders,
     historyOrders,
     pendingCount,
     merchantId,
}: OrdersTabsProps) {
     const t = useT()
     const router = useRouter();
     const { toast } = useToast();
     const [isPending, startTransition] = useTransition();

     const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
          try {
               const res = await updateOrderStatus(
                    orderId,
                    newStatus,
                    merchantId
               );

               if (res.success) {
                    toast({
                         title: t('Success'),
                         description: res.message,
                         variant: 'default'
                    });

                    startTransition(() => {
                         router.refresh();
                    });
               } else {
                    toast({
                         title: t('Error'),
                         description: res.error || t('Failed to update order'),
                         variant: 'destructive'
                    });
               }
          } catch (_) {
               toast({
                    title: t('Error'),
                    description: t('Failed to update order status'),
                    variant: 'destructive'
               });
          }
     };

     return (
          <Tabs defaultValue="active" className="mt-6 sm:mt-8">
               <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1 bg-muted/50 rounded-xl">
                    <TabsTrigger
                         value="active"
                         className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 data-[state=active]:bg-background whitespace-nowrap rounded-lg"
                    >
                         <ShoppingBag className="w-4 h-4 flex-shrink-0" />
                         <span className="text-sm sm:text-base">{t("Active Orders")}</span>
                         {pendingCount > 0 && (
                              <Badge
                                   variant="destructive"
                                   className="ml-1 sm:ml-2 h-5 px-1.5 sm:px-2 text-xs text-white"
                              >
                                   {pendingCount}
                              </Badge>
                         )}
                    </TabsTrigger>
                    <TabsTrigger
                         value="history"
                         className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 data-[state=active]:bg-background whitespace-nowrap rounded-lg"
                    >
                         <History className="w-4 h-4 flex-shrink-0" />
                         <span className="text-sm sm:text-base">{t("History")}</span>
                    </TabsTrigger>
               </TabsList>

               <TabsContent value="active" className="space-y-4">
                    <ActiveOrders
                         orders={activeOrders}
                         onStatusUpdate={handleStatusUpdate}
                         isUpdating={isPending}
                    />
               </TabsContent>

               <TabsContent value="history" className="mt-4 sm:mt-6">
                    <HistoryOrders orders={historyOrders} />
               </TabsContent>
          </Tabs>
     );
}