"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ShoppingCart, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useT } from "@/hooks/use-inline-translation";

interface Order {
    id: string;
    status: string;
    createdAt: Date;
    orderPrices: {
        total: number;
    };
    user: {
        name: string | null;
        phone: string | null;
    };
}

interface MerchantOrdersProps {
    orders: Order[];
    merchantId: string;
}

export function MerchantOrders({ orders, merchantId }: MerchantOrdersProps) {
    const pendingOrders = orders.filter((o) => o.status === "PENDING");
    const t = useT();

    if (orders.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">{t("no_orders_yet")}</p>
                    <p className="text-sm text-muted-foreground">{t("This merchant hasn't received any orders")}</p>
                </CardContent>
            </Card>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING":
                return "bg-orange-100 text-orange-800 border-orange-300";
            case "ACCEPTED_BY_MERCHANT":
            case "ACCEPTED_BY_DRIVER":
                return "bg-blue-100 text-blue-800";
            case "IN_PREPARATION":
            case "READY_TO_DELIVER":
                return "bg-purple-100 text-purple-800";
            case "ON_THE_WAY":
                return "bg-indigo-100 text-indigo-800";
            case "COMPLETED":
                return "bg-green-100 text-green-800";
            case "REJECTED_BY_MERCHANT":
            case "REJECTED_BY_DRIVER":
            case "CANCELED_BY_MERCHANT":
            case "CANCELED_BY_DRIVER":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="space-y-4">
            {/* Pending Orders Alert */}
            {pendingOrders.length > 0 && (
                <Alert variant="destructive" className="border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                        <strong>{t("pending orders", { count: pendingOrders.length })}</strong>
                        {t("require immediate attention from the merchant")}
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("order_id")}</TableHead>
                                <TableHead>{t("customer")}</TableHead>
                                <TableHead>{t("phone")}</TableHead>
                                <TableHead>{t("total")}</TableHead>
                                <TableHead>{t("status")}</TableHead>
                                <TableHead>{t("date")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow
                                    key={order.id}
                                    className={
                                        order.status === "PENDING" ? "bg-orange-50/50" : ""
                                    }
                                >
                                    <TableCell className="font-mono text-sm">
                                        #{order.id.slice(-8)}
                                    </TableCell>
                                    <TableCell>{order.user.name || t("n_a")}</TableCell>
                                    <TableCell>{order.user.phone || t("n_a")}</TableCell>
                                    <TableCell className="font-medium">
                                        {t.formatAmount(order.orderPrices.total)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(order.status)}>
                                            {order.status === "PENDING" && (
                                                <AlertCircle className="mr-1 h-3 w-3" />
                                            )}
                                            {order.status.replace(/_/g, " ")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {t.formatDateTime(order.createdAt)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}