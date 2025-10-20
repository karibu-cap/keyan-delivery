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
import { WithdrawalInfo } from "./WithdrawalInfo";
import { useDriverOrders } from "@/hooks/use-driver-orders";
import { useOrderStatus } from "@/hooks/use-order-status";
import { useWallet } from "@/hooks/use-wallet";
import { useEffect } from "react";

export function DriverOrderTabs() {
    const { availableOrders, inProgressOrders, completedOrders, loading, error, refreshOrders } = useDriverOrders();
    const { balance, refreshWallet } = useWallet();

    // Hook for order status updates with refresh callback
    const { } = useOrderStatus({
        redirectOnComplete: false,
        onOrderUpdate: () => {
            refreshOrders();
            refreshWallet();
        }
    });

    useEffect(() => {
        refreshOrders();
    }, [refreshOrders]);
    return (
        <Tabs defaultValue="available" className="space-y-6">
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 md:grid-cols-5 rounded-2xl">
                <TabsTrigger value="available" className="rounded-2xl">
                    Available Orders ({availableOrders.length})
                </TabsTrigger>
                <TabsTrigger value="active" className="rounded-2xl">
                    Active Deliveries ({inProgressOrders.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="rounded-2xl">
                    Completed Deliveries ({completedOrders.length})
                </TabsTrigger>
                <TabsTrigger value="transactions" className="rounded-2xl">
                    Transactions
                </TabsTrigger>
                <TabsTrigger value="withdraw" className="rounded-2xl">
                    Withdraw
                </TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="space-y-4">
                {loading ? (
                    <Card className="p-12 rounded-2xl text-center">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Loading orders...</h3>
                    </Card>
                ) : error ? (
                    <Card className="p-12 rounded-2xl text-center">
                        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Error loading orders</h3>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <button
                            onClick={refreshOrders}
                            className="text-primary hover:underline"
                        >
                            Try again
                        </button>
                    </Card>
                ) : availableOrders.length === 0 ? (
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
                            />
                        ))}
                    </div>
                )}
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
                {loading ? (
                    <Card className="p-12 rounded-2xl text-center">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Loading deliveries...</h3>
                    </Card>
                ) : error ? (
                    <Card className="p-12 rounded-2xl text-center">
                        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Error loading deliveries</h3>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <button
                            onClick={refreshOrders}
                            className="text-primary hover:underline"
                        >
                            Try again
                        </button>
                    </Card>
                ) : inProgressOrders.length === 0 ? (
                    <Card className="p-12 rounded-2xl text-center">
                        <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No active deliveries</h3>
                        <p className="text-muted-foreground">
                            Accept an order to start delivering
                        </p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {inProgressOrders.map((order) => (
                            <DriverOrderCard
                                key={order.id}
                                order={order}
                                isActive
                            />
                        ))}
                    </div>
                )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
                {loading ? (
                    <Card className="p-12 rounded-2xl text-center">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Loading completed deliveries...</h3>
                    </Card>
                ) : error ? (
                    <Card className="p-12 rounded-2xl text-center">
                        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Error loading completed deliveries</h3>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <button
                            onClick={refreshOrders}
                            className="text-primary hover:underline"
                        >
                            Try again
                        </button>
                    </Card>
                ) : completedOrders.length === 0 ? (
                    <Card className="p-12 rounded-2xl text-center">
                        <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No completed deliveries</h3>
                        <p className="text-muted-foreground">
                            No completed deliveries found
                        </p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {completedOrders.map((order) => (
                            <DriverOrderCard
                                key={order.id}
                                order={order}
                                isActive
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
                        availableBalance={balance}
                        onSuccess={refreshWallet}
                    />
                    <WithdrawalInfo />
                </div>
            </TabsContent>
        </Tabs>
    );
}