"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { getAvailableOrders, acceptOrder, completeDelivery } from "@/lib/actions/driver";
import OrderMap from "@/components/driver/OrderMap";
import { OrderStatus, DriverStatus } from "@prisma/client";
import { useAuthStore } from "@/hooks/auth-store";
import { DriverStatsCards } from "@/components/driver/DriverStatsCards";
import { DriverLoadingState } from "@/components/driver/DriverLoadingState";
import { DriverPendingStatus } from "@/components/driver/DriverPendingStatus";
import { DriverRejectedStatus } from "@/components/driver/DriverRejectedStatus";
import { DriverOrderTabs } from "@/components/driver/DriverOrderTabs";

interface Order {
   id: string;
   status: OrderStatus;
   createdAt: Date;
   pickupCode: string | null;
   deliveryCode: string | null;
   orderPrices: {
      total: number;
      deliveryFee: number;
   };
   deliveryInfo: {
      address: string;
      delivery_latitude: number;
      delivery_longitude: number;
      deliveryContact: string | null;
      additionalNotes?: string | null;
   };
   merchant: {
      businessName: string;
      address: {
         latitude: number;
         longitude: number;
      };
   };
   items: Array<{
      id: string;
      quantity: number;
      price: number;
      product: {
         title: string;
      };
   }>;
}

export default function DriverDashboard() {
   const { toast } = useToast();
   const { user } = useAuthStore();
   const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
   const [activeOrders, setActiveOrders] = useState<Order[]>([]);
   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
   const [pickupCode, setPickupCode] = useState("");
   const [deliveryCode, setDeliveryCode] = useState("");
   const [loading, setLoading] = useState(false);
   const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
   const [walletBalance, setWalletBalance] = useState(0);


   const loadOrders = useCallback(async () => {
      try {
         setLoading(true);
         const orders = await getAvailableOrders();

         // Séparer les commandes disponibles et actives
         const available = orders.filter(
            (order: Order) => order.status === OrderStatus.READY_TO_DELIVER
         );
         const active = orders.filter(
            (order: Order) =>
               order.status === OrderStatus.ACCEPTED_BY_DRIVER || order.status === OrderStatus.ON_THE_WAY
         );

         setAvailableOrders(available);
         setActiveOrders(active);
      } catch (error) {
         toast({
            title: "Error loading orders",
            description: "Failed to load available orders",
            variant: "destructive",
         });
         console.error("Error loading orders:", error);
      } finally {
         setLoading(false);
      }
   }, [toast]);

   const handleAcceptOrder = async (orderId: string) => {
      if (!pickupCode.trim()) {
         toast({
            title: "Pickup code required",
            description: "Please enter the pickup code from the merchant",
            variant: "destructive",
         });
         return;
      }

      setProcessingOrderId(orderId);
      try {
         const result = await acceptOrder(orderId, pickupCode);

         if (result.success) {
            toast({
               title: "Order accepted!",
               description: "You can now start the delivery",
               variant: "default",
            });
            setPickupCode("");
            await loadOrders();
         } else {
            throw new Error(result.error || "Failed to accept order");
         }
      } catch (error) {
         toast({
            title: "Failed to accept order",
            description: error instanceof Error ? error.message : "Please try again",
            variant: "destructive",
         });
      } finally {
         setProcessingOrderId(null);
      }
   };

   const handleCompleteDelivery = async (orderId: string) => {
      if (!deliveryCode.trim()) {
         toast({
            title: "Delivery code required",
            description: "Please enter the delivery code from the customer",
            variant: "destructive",
         });
         return;
      }

      setProcessingOrderId(orderId);
      try {
         const result = await completeDelivery(orderId, deliveryCode);

         if (result.success) {
            toast({
               title: "Delivery completed!",
               description: `You earned $${result.earnings?.toFixed(2)}`,
               variant: "default",
            });
            setDeliveryCode("");
            await loadOrders();
         } else {
            throw new Error(result.error || "Failed to complete delivery");
         }
      } catch (error) {
         toast({
            title: "Failed to complete delivery",
            description: error instanceof Error ? error.message : "Please try again",
            variant: "destructive",
         });
      } finally {
         setProcessingOrderId(null);
      }
   };


   const loadWallet = useCallback(async () => {
      try {
         const response = await fetch("/api/v1/driver/wallet");
         const data = await response.json();
         if (data.success) {
            setWalletBalance(data.data.balance || 0);
         }
      } catch (error) {
         console.error("Error loading wallet:", error);
      }
   }, []);

   useEffect(() => {
      if (user?.driverStatus === DriverStatus.APPROVED) {
         loadOrders();
         loadWallet();
      }
   }, [loadOrders, loadWallet, user?.driverStatus]);


   if (loading) {
      return <DriverLoadingState />;
   }

   // Affichage si le statut est PENDING
   if (user?.driverStatus === DriverStatus.PENDING) {
      return <DriverPendingStatus />;
   }

   // Affichage si le statut est REJECTED ou BANNED
   if (user?.driverStatus === DriverStatus.REJECTED || user?.driverStatus === DriverStatus.BANNED) {
      return <DriverRejectedStatus driverStatus={user.driverStatus} />;
   }

   return (
      <div className="min-h-screen bg-background">
         <Navbar />

         <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
               <h1 className="text-4xl font-bold mb-2">Driver Dashboard</h1>
               <p className="text-muted-foreground">Manage your deliveries and earnings</p>
            </div>

            {/* Stats Cards */}
            <DriverStatsCards
               availableOrdersCount={availableOrders.length}
               activeOrdersCount={activeOrders.length}
               todayEarnings={activeOrders.reduce((sum, order) => sum + order.orderPrices.deliveryFee, 0)}
               walletBalance={walletBalance}
            />

            {/* Orders Tabs */}
            <DriverOrderTabs
               availableOrders={availableOrders}
               activeOrders={activeOrders}
               walletBalance={walletBalance}
               processingOrderId={processingOrderId}
               onAcceptOrder={handleAcceptOrder}
               onCompleteDelivery={handleCompleteDelivery}
               onViewOnMap={setSelectedOrder}
               onWalletUpdate={loadWallet}
            />
         </div>

         {/* Map Modal */}
         {selectedOrder && (
            <OrderMap
               order={selectedOrder}
               onClose={() => setSelectedOrder(null)}
            />
         )}
      </div>
   );
}
