import { OrderStatus } from "@prisma/client"

/**
 * Check if an order can be tracked
 */
export function canTrackOrder(status: OrderStatus): boolean {
    return [
        OrderStatus.ACCEPTED_BY_DRIVER,
        OrderStatus.IN_PREPARATION,
        OrderStatus.READY_TO_DELIVER,
        OrderStatus.ON_THE_WAY,
    ].some((e) => e === status)
}

/**
 * Check if an order can be cancelled by the customer
 */
export function canCancelOrder(status: OrderStatus): boolean {
    return [
        OrderStatus.PENDING,
        OrderStatus.ACCEPTED_BY_MERCHANT,
    ].some((e) => e === status)
}

/**
 * Check if an order can be reordered
 */
export function canReorder(status: OrderStatus): boolean {
    return [
        OrderStatus.COMPLETED,
        OrderStatus.REJECTED_BY_MERCHANT,
        OrderStatus.REJECTED_BY_DRIVER,
        OrderStatus.CANCELED_BY_MERCHANT,
        OrderStatus.CANCELED_BY_DRIVER,
    ].some((e) => e === status)
}

/**
 * Get active order statuses
 */
export function getActiveOrderStatuses(): OrderStatus[] {
    return [
        OrderStatus.PENDING,
        OrderStatus.ACCEPTED_BY_MERCHANT,
        OrderStatus.ACCEPTED_BY_DRIVER,
        OrderStatus.IN_PREPARATION,
        OrderStatus.READY_TO_DELIVER,
        OrderStatus.ON_THE_WAY,
    ]
}

/**
 * Get completed/cancelled order statuses
 */
export function getHistoryOrderStatuses(): OrderStatus[] {
    return [
        OrderStatus.COMPLETED,
        OrderStatus.REJECTED_BY_MERCHANT,
        OrderStatus.REJECTED_BY_DRIVER,
        OrderStatus.CANCELED_BY_MERCHANT,
        OrderStatus.CANCELED_BY_DRIVER,
    ]
}

/**
 * Check if order is in active state
 */
export function isActiveOrder(status: OrderStatus): boolean {
    return getActiveOrderStatuses().includes(status)
}

/**
 * Get order status color
 */
export function getOrderStatusColor(status: OrderStatus): string {
    switch (status) {
        case OrderStatus.PENDING:
            return "bg-yellow-500 text-yellow-50 border-yellow-500"
        case OrderStatus.ACCEPTED_BY_MERCHANT:
        case OrderStatus.ACCEPTED_BY_DRIVER:
            return "bg-blue-500 text-blue-50 border-blue-500"
        case OrderStatus.IN_PREPARATION:
        case OrderStatus.READY_TO_DELIVER:
            return "bg-purple-500 text-purple-50 border-purple-500"
        case OrderStatus.ON_THE_WAY:
            return "bg-indigo-500 text-indigo-50 border-indigo-500"
        case OrderStatus.COMPLETED:
            return "bg-green-500 text-green-50 border-green-500"
        case OrderStatus.REJECTED_BY_MERCHANT:
        case OrderStatus.REJECTED_BY_DRIVER:
        case OrderStatus.CANCELED_BY_MERCHANT:
        case OrderStatus.CANCELED_BY_DRIVER:
            return "bg-red-500 text-red-50 border-red-500"
        default:
            return "bg-gray-500 text-gray-50 border-gray-500"
    }
}

/**
 * Get order status label
 */
export function getOrderStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
        [OrderStatus.PENDING]: "Pending",
        [OrderStatus.ACCEPTED_BY_MERCHANT]: "Accepted by Merchant",
        [OrderStatus.ACCEPTED_BY_DRIVER]: "Driver Assigned",
        [OrderStatus.REJECTED_BY_MERCHANT]: "Rejected by Merchant",
        [OrderStatus.REJECTED_BY_DRIVER]: "Rejected by Driver",
        [OrderStatus.CANCELED_BY_MERCHANT]: "Cancelled by Merchant",
        [OrderStatus.CANCELED_BY_DRIVER]: "Cancelled by Driver",
        [OrderStatus.ON_THE_WAY]: "On the Way",
        [OrderStatus.IN_PREPARATION]: "In Preparation",
        [OrderStatus.READY_TO_DELIVER]: "Ready to Deliver",
        [OrderStatus.COMPLETED]: "Completed",
    }

    return labels[status] || status
}

/**
 * Calculate estimated delivery time based on status
 */
export function getEstimatedDeliveryMinutes(status: OrderStatus): number | null {
    switch (status) {
        case OrderStatus.PENDING:
            return 60
        case OrderStatus.ACCEPTED_BY_MERCHANT:
            return 50
        case OrderStatus.IN_PREPARATION:
            return 40
        case OrderStatus.READY_TO_DELIVER:
            return 30
        case OrderStatus.ACCEPTED_BY_DRIVER:
        case OrderStatus.ON_THE_WAY:
            return 20
        default:
            return null
    }
}

/**
 * Format order ID for display
 */
export function formatOrderId(orderId: string): string {
    return `#${orderId.slice(0, 4)}-${orderId.slice(-4)}`
}

/**
 * Calculate order item count
 */
export function calculateOrderItemCount(items: { quantity: number }[]): number {
    return items.reduce((sum, item) => sum + item.quantity, 0)
}

/**
 * Get order timeline steps based on status
 */
export function getOrderTimelineSteps(status: OrderStatus) {
    const steps = [
        {
            status: OrderStatus.PENDING,
            label: "Order Placed",
            description: "Your order has been received",
        },
        {
            status: OrderStatus.ACCEPTED_BY_MERCHANT,
            label: "Confirmed",
            description: "Merchant confirmed your order",
        },
        {
            status: OrderStatus.IN_PREPARATION,
            label: "Preparing",
            description: "Your order is being prepared",
        },
        {
            status: OrderStatus.READY_TO_DELIVER,
            label: "Ready",
            description: "Order is ready for pickup",
        },
        {
            status: OrderStatus.ACCEPTED_BY_DRIVER,
            label: "Driver Assigned",
            description: "Driver is on the way to merchant",
        },
        {
            status: OrderStatus.ON_THE_WAY,
            label: "On the Way",
            description: "Driver is delivering your order",
        },
        {
            status: OrderStatus.COMPLETED,
            label: "Delivered",
            description: "Order delivered successfully",
        },
    ]

    const statusOrder = [
        OrderStatus.PENDING,
        OrderStatus.ACCEPTED_BY_MERCHANT,
        OrderStatus.IN_PREPARATION,
        OrderStatus.READY_TO_DELIVER,
        OrderStatus.ACCEPTED_BY_DRIVER,
        OrderStatus.ON_THE_WAY,
        OrderStatus.COMPLETED,
    ]

    const currentIndex = statusOrder.findIndex((e) => e === status)

    return steps.map((step, index) => ({
        ...step,
        completed: index <= currentIndex,
        current: index === currentIndex,
    }))
}

/**
 * Validate delivery location coordinates
 */
export function isValidCoordinates(
    coordinates: number[] | undefined
): coordinates is [number, number] {
    return (
        Array.isArray(coordinates) &&
        coordinates.length === 2 &&
        typeof coordinates[0] === "number" &&
        typeof coordinates[1] === "number" &&
        coordinates[0] >= -180 &&
        coordinates[0] <= 180 &&
        coordinates[1] >= -90 &&
        coordinates[1] <= 90
    )
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
    coord1: [number, number],
    coord2: [number, number]
): number {
    const R = 6371 // Earth's radius in km
    const lat1 = (coord1[1] * Math.PI) / 180
    const lat2 = (coord2[1] * Math.PI) / 180
    const deltaLat = ((coord2[1] - coord1[1]) * Math.PI) / 180
    const deltaLon = ((coord2[0] - coord1[0]) * Math.PI) / 180

    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)}m`
    }
    return `${distanceKm.toFixed(1)}km`
}

// app/merchant/[merchantId]/lib/orderUtils.ts
import {
  CheckCircle,
  ChefHat,
  Clock,
  Package,
  Truck,
  XCircle
} from "lucide-react"


export function getStatusIcon(status: string) {
  const statusIcons: Record<string, any> = {
    PENDING: Clock,
    ACCEPTED_BY_MERCHANT: CheckCircle,
    IN_PREPARATION: ChefHat,
    READY_TO_DELIVER: Package,
    ACCEPTED_BY_DRIVER: Truck,
    ON_THE_WAY: Truck,
    COMPLETED: CheckCircle,
  };

  return statusIcons[status] || XCircle;
}

export function getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
  const statusFlow: Record<string, OrderStatus> = {
    PENDING: OrderStatus.ACCEPTED_BY_MERCHANT,
    ACCEPTED_BY_MERCHANT: OrderStatus.IN_PREPARATION,
    IN_PREPARATION: OrderStatus.READY_TO_DELIVER,
  };

  return statusFlow[currentStatus] || null;
}

export function canReject(status: OrderStatus): boolean {
  return status === OrderStatus.PENDING;
}

export function canCancel(status: OrderStatus): boolean {
  return [OrderStatus.ACCEPTED_BY_MERCHANT, OrderStatus.IN_PREPARATION].some((e) => e === status);
}