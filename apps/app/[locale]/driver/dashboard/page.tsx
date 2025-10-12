"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
   MapPin,
   Package,
   DollarSign,
   Navigation,
   CheckCircle,
   Clock,
   AlertCircle,
   XCircle,
   Wallet,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAvailableOrders, acceptOrder, completeDelivery } from "@/lib/actions/driver";
import OrderMap from "@/components/driver/OrderMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderStatus, DriverStatus } from "@prisma/client";
import { useAuthStore } from "@/hooks/auth-store";
import { TransactionHistory } from "@/components/driver/TransactionHistory";
import { WithdrawalForm } from "@/components/driver/WithdrawalForm";

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
   const [loading, setLoading] = useState(true);
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
      loadOrders();
      if (user?.driverStatus === DriverStatus.APPROVED) {
         loadWallet();
      }
   }, [loadOrders, loadWallet, user?.driverStatus]);

   const OrderCard = ({ order, isActive = false }: { order: Order; isActive?: boolean }) => (
      <Card className="p-6 rounded-2xl shadow-card hover:shadow-lg transition-all">
         <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
               <div>
                  <h3 className="font-semibold text-lg">{order.merchant.businessName}</h3>
                  <p className="text-sm text-muted-foreground">
                     Order #{order.id.slice(-6)}
                  </p>
               </div>
               <Badge variant={isActive ? "default" : "secondary"}>
                  {isActive ? "Active" : "Available"}
               </Badge>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-2 gap-4">
               <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{order.items.length} items</span>
               </div>
               <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-success" />
                  <span className="text-sm font-semibold text-success">
                     ${order.orderPrices.deliveryFee.toFixed(2)}
                  </span>
               </div>
            </div>

            {/* Delivery Address */}
            <div className="flex items-start gap-2 p-3 bg-accent/50 rounded-lg">
               <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
               <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Delivery to:</p>
                  <p className="text-sm text-muted-foreground truncate">
                     {order.deliveryInfo.address}
                  </p>
                  <p className="text-sm text-muted-foreground">
                     Contact: {order.deliveryInfo.deliveryContact}
                  </p>
               </div>
            </div>

            {/* Items List */}
            <div className="border-t pt-3">
               <p className="text-sm font-medium mb-2">Items:</p>
               <div className="space-y-1">
                  {order.items.map((item) => (
                     <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                           {item.quantity}x {item.product.title}
                        </span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                     </div>
                  ))}
               </div>
               <div className="flex justify-between font-semibold text-sm mt-2 pt-2 border-t">
                  <span>Total:</span>
                  <span>${order.orderPrices.total.toFixed(2)}</span>
               </div>
            </div>

            {/* Action Buttons */}
            {!isActive ? (
               <div className="space-y-3">
                  <div>
                     <Label htmlFor={`pickup-${order.id}`} className="text-sm mb-1">
                        Enter Pickup Code
                     </Label>
                     <Input
                        id={`pickup-${order.id}`}
                        placeholder="Enter code from merchant"
                        value={pickupCode}
                        onChange={(e) => setPickupCode(e.target.value.toUpperCase())}
                        className="uppercase"
                     />
                  </div>
                  <Button
                     className="w-full rounded-2xl"
                     onClick={() => handleAcceptOrder(order.id)}
                     disabled={processingOrderId === order.id}
                  >
                     {processingOrderId === order.id ? "Processing..." : "Accept Order"}
                  </Button>
                  <Button
                     variant="outline"
                     className="w-full rounded-2xl"
                     onClick={() => setSelectedOrder(order)}
                  >
                     <Navigation className="w-4 h-4 mr-2" />
                     View on Map
                  </Button>
               </div>
            ) : (
               <div className="space-y-3">
                  {order.status === "ACCEPTED_BY_DRIVER" && (
                     <>
                        <p className="text-sm text-center text-muted-foreground">
                           Pickup Code: <span className="font-mono font-bold text-foreground">{order.pickupCode}</span>
                        </p>
                        <Button
                           variant="outline"
                           className="w-full rounded-2xl"
                           onClick={() => setSelectedOrder(order)}
                        >
                           <Navigation className="w-4 h-4 mr-2" />
                           Navigate
                        </Button>
                     </>
                  )}
                  {order.status === "ON_THE_WAY" && (
                     <>
                        <div>
                           <Label htmlFor={`delivery-${order.id}`} className="text-sm mb-1">
                              Enter Delivery Code
                           </Label>
                           <Input
                              id={`delivery-${order.id}`}
                              placeholder="Enter code from customer"
                              value={deliveryCode}
                              onChange={(e) => setDeliveryCode(e.target.value.toUpperCase())}
                              className="uppercase"
                           />
                        </div>
                        <Button
                           className="w-full rounded-2xl"
                           onClick={() => handleCompleteDelivery(order.id)}
                           disabled={processingOrderId === order.id}
                        >
                           {processingOrderId === order.id ? "Processing..." : "Complete Delivery"}
                        </Button>
                        <Button
                           variant="outline"
                           className="w-full rounded-2xl"
                           onClick={() => setSelectedOrder(order)}
                        >
                           <Navigation className="w-4 h-4 mr-2" />
                           Navigate
                        </Button>
                     </>
                  )}
               </div>
            )}
         </div>
      </Card>
   );

   if (loading) {
      return (
         <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
               <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                     <p className="text-muted-foreground">Loading...</p>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   // Affichage si le statut est PENDING
   if (user?.driverStatus === DriverStatus.PENDING) {
      return (
         <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
               <Card className="p-12 rounded-2xl shadow-card max-w-2xl mx-auto text-center">
                  <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h1 className="text-3xl font-bold mb-4">Application en attente</h1>
                  <p className="text-lg text-muted-foreground mb-6">
                     Votre demande pour devenir chauffeur est en cours de révision.
                  </p>
                  <div className="bg-accent/50 p-6 rounded-lg">
                     <p className="text-sm text-muted-foreground">
                        Veuillez patienter pendant que l&apos;administrateur examine votre demande.
                        Vous recevrez une notification une fois que votre compte sera approuvé.
                     </p>
                  </div>
               </Card>
            </div>
         </div>
      );
   }

   // Affichage si le statut est REJECTED ou BANNED
   if (user?.driverStatus === DriverStatus.REJECTED || user?.driverStatus === DriverStatus.BANNED) {
      const isBanned = user?.driverStatus === DriverStatus.BANNED;
      return (
         <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
               <Card className="p-12 rounded-2xl shadow-card max-w-2xl mx-auto text-center border-red-500">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h1 className="text-3xl font-bold mb-4 text-red-600">
                     {isBanned ? "Compte banni" : "Demande rejetée"}
                  </h1>
                  <p className="text-lg text-muted-foreground mb-6">
                     {isBanned
                        ? "Votre compte chauffeur a été banni."
                        : "Votre demande pour devenir chauffeur a été rejetée."}
                  </p>
                  <div className="bg-red-50 p-6 rounded-lg">
                     <p className="text-sm text-muted-foreground">
                        {isBanned
                           ? "Veuillez contacter l'administrateur pour plus d'informations."
                           : "Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administrateur."}
                     </p>
                  </div>
               </Card>
            </div>
         </div>
      );
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
               <Card className="p-6 rounded-2xl shadow-card">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary" />
                     </div>
                     <div>
                        <p className="text-sm text-muted-foreground">Available Orders</p>
                        <p className="text-2xl font-bold">{availableOrders.length}</p>
                     </div>
                  </div>
               </Card>

               <Card className="p-6 rounded-2xl shadow-card">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-success" />
                     </div>
                     <div>
                        <p className="text-sm text-muted-foreground">Active Deliveries</p>
                        <p className="text-2xl font-bold">{activeOrders.length}</p>
                     </div>
                  </div>
               </Card>

               <Card className="p-6 rounded-2xl shadow-card">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-success" />
                     </div>
                     <div>
                        <p className="text-sm text-muted-foreground">Total Earnings Today</p>
                        <p className="text-2xl font-bold">
                           $
                           {activeOrders
                              .reduce((sum, order) => sum + order.orderPrices.deliveryFee, 0)
                              .toFixed(2)}
                        </p>
                     </div>
                  </div>
               </Card>

               <Card className="p-6 rounded-2xl shadow-card bg-gradient-to-br from-primary/10 to-primary/5">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-white" />
                     </div>
                     <div>
                        <p className="text-sm text-muted-foreground">Wallet Balance</p>
                        <p className="text-2xl font-bold text-primary">
                           ${walletBalance.toFixed(2)}
                        </p>
                     </div>
                  </div>
               </Card>
            </div>

            {/* Orders Tabs */}
            <Tabs defaultValue="available" className="space-y-6">
               <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 md:grid-cols-4 rounded-2xl">
                  <TabsTrigger value="available" className="rounded-2xl">
                     Available Orders ({availableOrders.length})
                  </TabsTrigger>
                  <TabsTrigger value="active" className="rounded-2xl">
                     Active Deliveries ({activeOrders.length})
                  </TabsTrigger>
                  <TabsTrigger value="transactions" className="rounded-2xl">
                     Transactions
                  </TabsTrigger>
                  <TabsTrigger value="withdraw" className="rounded-2xl">
                     Withdraw
                  </TabsTrigger>
               </TabsList>

               <TabsContent value="available" className="space-y-4">
                  {availableOrders.length === 0 ? (
                     <Card className="p-12 rounded-2xl text-center">
                        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No available orders</h3>
                        <p className="text-muted-foreground">
                           Check back later for new delivery opportunities
                        </p>
                     </Card>
                  ) : (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {availableOrders.map((order) => (
                           <OrderCard key={order.id} order={order} />
                        ))}
                     </div>
                  )}
               </TabsContent>

               <TabsContent value="active" className="space-y-4">
                  {activeOrders.length === 0 ? (
                     <Card className="p-12 rounded-2xl text-center">
                        <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No active deliveries</h3>
                        <p className="text-muted-foreground">
                           Accept an order to start delivering
                        </p>
                     </Card>
                  ) : (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {activeOrders.map((order) => (
                           <OrderCard key={order.id} order={order} isActive />
                        ))}
                     </div>
                  )}
               </TabsContent>

               <TabsContent value="transactions" className="space-y-4">
                  <TransactionHistory />
               </TabsContent>

               <TabsContent value="withdraw" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     <WithdrawalForm
                        availableBalance={walletBalance}
                        onSuccess={loadWallet}
                     />
                     <Card className="p-6 rounded-2xl shadow-card">
                        <h3 className="text-lg font-semibold mb-4">Withdrawal Information</h3>
                        <div className="space-y-4">
                           <div className="bg-accent/50 p-4 rounded-lg">
                              <p className="text-sm font-medium mb-2">How it works:</p>
                              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                                 <li>Enter the amount you want to withdraw</li>
                                 <li>Provide your MTN Mobile Money number</li>
                                 <li>Funds will be sent within 24 hours</li>
                                 <li>You&apos;ll receive a confirmation SMS</li>
                              </ul>
                           </div>
                           <div className="bg-primary/10 p-4 rounded-lg">
                              <p className="text-sm font-medium mb-2 text-primary">Important:</p>
                              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                                 <li>Minimum withdrawal: $10.00</li>
                                 <li>Maximum withdrawal: $1,000.00 per day</li>
                                 <li>Ensure your phone number is correct</li>
                              </ul>
                           </div>
                        </div>
                     </Card>
                  </div>
               </TabsContent>
            </Tabs>
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
