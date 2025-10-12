"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    Package,
    DollarSign,
    Navigation,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

interface DriverOrderCardProps {
    order: Order;
    isActive?: boolean;
    processingOrderId: string | null;
    onAcceptOrder: (orderId: string) => Promise<void>;
    onCompleteDelivery: (orderId: string) => Promise<void>;
    onViewOnMap: (order: Order) => void;
}

export function DriverOrderCard({
    order,
    isActive = false,
    processingOrderId,
    onAcceptOrder,
    onCompleteDelivery,
    onViewOnMap,
}: DriverOrderCardProps) {
    const { toast } = useToast();
    const [pickupCode, setPickupCode] = useState("");
    const [deliveryCode, setDeliveryCode] = useState("");

    const handleAcceptOrder = async () => {
        if (!pickupCode.trim()) {
            toast({
                title: "Pickup code required",
                description: "Please enter the pickup code from the merchant",
                variant: "destructive",
            });
            return;
        }

        await onAcceptOrder(order.id);
        setPickupCode("");
    };

    const handleCompleteDelivery = async () => {
        if (!deliveryCode.trim()) {
            toast({
                title: "Delivery code required",
                description: "Please enter the delivery code from the customer",
                variant: "destructive",
            });
            return;
        }

        await onCompleteDelivery(order.id);
        setDeliveryCode("");
    };

    return (
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
                            onClick={handleAcceptOrder}
                            disabled={processingOrderId === order.id}
                        >
                            {processingOrderId === order.id ? "Processing..." : "Accept Order"}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full rounded-2xl"
                            onClick={() => onViewOnMap(order)}
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
                                    onClick={() => onViewOnMap(order)}
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
                                    onClick={handleCompleteDelivery}
                                    disabled={processingOrderId === order.id}
                                >
                                    {processingOrderId === order.id ? "Processing..." : "Complete Delivery"}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full rounded-2xl"
                                    onClick={() => onViewOnMap(order)}
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
}