"use client";

import { Card } from "@/components/ui/card";
import { useDriverOrders } from "@/hooks/use-driver-orders";
import { useWallet } from "@/hooks/use-wallet";
import {
    Package,
    Clock,
    Wallet,
    Motorbike,
} from "lucide-react";
import { useEffect } from "react";

interface DriverStatsCardsProps {
}

export function DriverStatsCards({
}: DriverStatsCardsProps) {

    const { balance, refreshWallet } = useWallet();
    const { availableOrders, inProgressOrders, completedOrders } = useDriverOrders();

    useEffect(() => {
        refreshWallet();
    }, []);
    return (
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
                        <p className="text-2xl font-bold">{inProgressOrders.length}</p>
                    </div>
                </div>
            </Card>

            <Card className="p-6 rounded-2xl shadow-card">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center">
                        <Motorbike className="w-6 h-6 text-success" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Completed Deliveries</p>
                        <p className="text-2xl font-bold">{completedOrders.length}</p>
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
                            ${balance.toFixed(2)}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}