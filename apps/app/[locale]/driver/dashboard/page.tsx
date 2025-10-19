"use client";

import { DriverLoadingState } from "@/components/driver/DriverLoadingState";
import { DriverOrderTabs } from "@/components/driver/DriverOrderTabs";
import { DriverPendingStatus } from "@/components/driver/DriverPendingStatus";
import { DriverRejectedStatus } from "@/components/driver/DriverRejectedStatus";
import { DriverStatsCards } from "@/components/driver/DriverStatsCards";
import OrderMap from "@/components/driver/OrderMap";
import { useAuthStore } from "@/hooks/auth-store";
import { useToast } from "@/hooks/use-toast";
import { fetchDriverAvailableOrders, fetchDriverInProgressOrders } from "@/lib/actions/client/driver";
import { getUserWallet } from "@/lib/actions/client/user";
import { acceptOrder, completeDelivery } from "@/lib/actions/driver";
import { DriverStatus, OrderStatus } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";

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
     const [inProgressOrders, setInProgressOrders] = useState<Order[]>([]);
     const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
     const [pickupCode, setPickupCode] = useState("");
     const [deliveryCode, setDeliveryCode] = useState("");
     const [loading, setLoading] = useState(false);
     const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
     const [walletBalance, setWalletBalance] = useState(0);


     const loadOrders = useCallback(async () => {
          try {
               setLoading(true);
               const ordersAvailable = await fetchDriverAvailableOrders();

               const ordersInProgress = await fetchDriverInProgressOrders();
               setAvailableOrders(ordersAvailable.data);
               setInProgressOrders(ordersInProgress.data);
          } catch (error) {
               toast({
                    title: error instanceof Error ? error.message : "Error loading orders",
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
               const response = await getUserWallet(user?.authId || "");
               const data = await response;
               if (data.success) {
                    setWalletBalance(data.data.balance || 0);
               }
          } catch (error) {
               console.error("Error loading wallet:", error);
          }
     }, [user?.authId]);

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

               <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                         <h1 className="text-4xl font-bold mb-2">Driver Dashboard</h1>
                         <p className="text-muted-foreground">Manage your deliveries and earnings</p>
                    </div>

                    {/* Stats Cards */}
                    <DriverStatsCards
                         availableOrdersCount={availableOrders.length}
                         inProgressOrdersCount={inProgressOrders.length}
                         walletBalance={walletBalance}
                    />

                    {/* Orders Tabs */}
                    <DriverOrderTabs
                         availableOrders={availableOrders}
                         activeOrders={inProgressOrders}
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
