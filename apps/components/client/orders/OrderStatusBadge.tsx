'use client'
import { Badge } from "@/components/ui/badge"
import { useT } from "@/hooks/use-inline-translation";
import { OrderStatus } from "@prisma/client"

interface OrderStatusBadgeProps {
    status: OrderStatus
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
    const t = useT();

    const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
        "PENDING": { label: t("Pending"), className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
        "ACCEPTED_BY_MERCHANT": { label: t("Confirmed"), className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
        "IN_PREPARATION": { label: t("Preparing"), className: "bg-purple-100 text-purple-800 hover:bg-purple-100" },
        "ON_THE_WAY": { label: t("Out for Delivery"), className: "bg-orange-100 text-orange-800 hover:bg-orange-100" },
        "COMPLETED": { label: t("Delivered"), className: "bg-green-100 text-green-800 hover:bg-green-100" },
        "REJECTED_BY_MERCHANT": { label: t("Rejected by Merchant"), className: "bg-red-100 text-red-800 hover:bg-red-100" },
        "ACCEPTED_BY_DRIVER": { label: t("Accepted by Driver"), className: "bg-green-100 text-green-800 hover:bg-green-100" },
        "REJECTED_BY_DRIVER": { label: t("Rejected by Driver"), className: "bg-red-100 text-red-800 hover:bg-red-100" },
        "CANCELED_BY_MERCHANT": { label: t("Cancelled by Merchant"), className: "bg-red-100 text-red-800 hover:bg-red-100" },
        "CANCELED_BY_DRIVER": { label: t("Cancelled by Driver"), className: "bg-red-100 text-red-800 hover:bg-red-100" },
        "READY_TO_DELIVER": { label: t("Ready to Deliver"), className: "bg-green-100 text-green-800 hover:bg-green-100" },
    }

    const config = statusConfig[status]

    return (
        <Badge variant="secondary" className={config.className}>
            {config.label}
        </Badge>
    )
}
