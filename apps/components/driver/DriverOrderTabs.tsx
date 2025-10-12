"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    AlertCircle,
    CheckCircle,
} from "lucide-react";
import { DriverOrderCard } from "./DriverOrderCard";
import { TransactionHistory } from "./TransactionHistory";
import { WithdrawalForm } from "./WithdrawalForm";
import { OrderStatus } from "@prisma/client";

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

interface DriverOrderTabsProps {
    availableOrders: Order[];
    activeOrders: Order[];
    walletBalance: number;
    processingOrderId: string | null;
    onAcceptOrder: (orderId: string) => Promise<void>;
    onCompleteDelivery: (orderId: string) => Promise<void>;
    onViewOnMap: (order: Order) => void;
    onWalletUpdate: () => Promise<void>;
}

export function DriverOrderTabs({
    availableOrders,
    activeOrders,
    walletBalance,
    processingOrderId,
    onAcceptOrder,
    onCompleteDelivery,
    onViewOnMap,
    onWalletUpdate,
}: DriverOrderTabsProps) {
    return (
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
                            <DriverOrderCard
                                key={order.id}
                                order={order}
                                processingOrderId={processingOrderId}
                                onAcceptOrder={onAcceptOrder}
                                onCompleteDelivery={onCompleteDelivery}
                                onViewOnMap={onViewOnMap}
                            />
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
                            <DriverOrderCard
                                key={order.id}
                                order={order}
                                isActive
                                processingOrderId={processingOrderId}
                                onAcceptOrder={onAcceptOrder}
                                onCompleteDelivery={onCompleteDelivery}
                                onViewOnMap={onViewOnMap}
                            />
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
                        onSuccess={onWalletUpdate}
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
                                    <li>You'll receive a confirmation SMS</li>
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
    );
}