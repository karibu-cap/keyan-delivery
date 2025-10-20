"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { updateOrderStatus } from "@/lib/actions/merchants";
import { OrderStatus } from "@prisma/client";
import { useT } from "@/hooks/use-inline-translation";
import ActiveOrders from "./ActiveOrders";
import HistoryOrders from "./HistoryOrders";
import type { Order } from "@/types/merchant_types";

interface OrdersTabsProps {
     activeOrders: Order[];
     historyOrders: Order[];
     pendingCount: number;
     merchantId: string;
}

export default function OrdersTabs({
     activeOrders: initialActiveOrders,
     historyOrders: initialHistoryOrders,
     pendingCount,
     merchantId
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
          <Tabs defaultValue="active" className="space-y-6">
               <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="active" className="relative">
                         {t('Active Orders')}
                         {pendingCount > 0 && (
                              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                                   {pendingCount}
                              </span>
                         )}
                    </TabsTrigger>
                    <TabsTrigger value="history">{t('History')}</TabsTrigger>
               </TabsList>

               <TabsContent value="active" className="space-y-4">
                    <ActiveOrders
                         orders={initialActiveOrders}
                         onStatusUpdate={handleStatusUpdate}
                         isUpdating={isPending}
                    />
               </TabsContent>

               <TabsContent value="history" className="space-y-4">
                    <HistoryOrders orders={initialHistoryOrders} />
               </TabsContent>
          </Tabs>
     );
}
