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
import { getServerT } from "@/i18n/server-translations";
import { Package } from "lucide-react";

interface Order {
    id: string;
    status: string;
    createdAt: Date;
    orderPrices: {
        total: number;
        deliveryFee: number;
    };
    merchant: {
        businessName: string;
    };
    user: {
        name: string | null;
        phone: string | null;
    };
}

interface DriverOrdersProps {
    orders: Order[];
}

export async function DriverOrders({ orders }: DriverOrdersProps) {
    const t = await getServerT();
    if (orders.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">{t("No deliveries yet")}</p>
                    <p className="text-sm text-muted-foreground">
                        {t("This driver hasn't completed any deliveries")}
                    </p>
                </CardContent>
            </Card>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return "bg-green-100 text-green-800";
            case "ACCEPTED_BY_DRIVER":
            case "ON_THE_WAY":
            case "READY_TO_DELIVER":
                return "bg-blue-100 text-blue-800";
            case "REJECTED_BY_DRIVER":
            case "CANCELED_BY_DRIVER":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("Order ID")}</TableHead>
                            <TableHead>{t("Merchant")}</TableHead>
                            <TableHead>{t("Customer")}</TableHead>
                            <TableHead>{t("Order Total")}</TableHead>
                            <TableHead>{t("Delivery Fee")}</TableHead>
                            <TableHead>{t("Status")}</TableHead>
                            <TableHead>{t("Date")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-mono text-sm">
                                    #{order.id.slice(-8)}
                                </TableCell>
                                <TableCell>{order.merchant.businessName}</TableCell>
                                <TableCell>
                                    <div>
                                        <div>{order.user.name || "N/A"}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {order.user.phone || "N/A"}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {t.formatAmount(order.orderPrices.total)}
                                </TableCell>
                                <TableCell className="font-medium text-green-600">
                                    {t.formatAmount(order.orderPrices.deliveryFee)}
                                </TableCell>
                                <TableCell>
                                    <Badge className={getStatusColor(order.status)}>
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
    );
}