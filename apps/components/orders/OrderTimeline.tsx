import { OrderStatus } from "@prisma/client"
import { CheckIcon, PackageIcon, TruckIcon, HomeIcon } from "lucide-react"

interface OrderTimelineProps {
    status: OrderStatus
}

export function OrderTimeline({ status }: OrderTimelineProps) {
    const steps = [
        { id: OrderStatus.ACCEPTED_BY_MERCHANT, label: "Order Confirmed", icon: CheckIcon },
        { id: OrderStatus.IN_PREPARATION, label: "Preparing Order", icon: PackageIcon },
        { id: OrderStatus.ON_THE_WAY, label: "Out for Delivery", icon: TruckIcon },
        { id: OrderStatus.COMPLETED, label: "Delivered", icon: HomeIcon },
    ]

    const statusOrder = [OrderStatus.ACCEPTED_BY_MERCHANT, OrderStatus.IN_PREPARATION, OrderStatus.ON_THE_WAY, OrderStatus.COMPLETED] as OrderStatus[]
    const currentIndex = statusOrder.includes(status as OrderStatus) ? statusOrder.indexOf(status as OrderStatus) : -1

    return (
        <div className="relative">
            <div className="flex justify-between">
                {steps.map((step, index) => {
                    const isCompleted = index < currentIndex
                    const isCurrent = index === currentIndex - 1
                    const Icon = step.icon

                    return (
                        <div key={step.id} className="flex flex-1 flex-col items-start">
                            <div className="relative flex w-full items-center">
                                {index > 0 && (
                                    <div
                                        className={`absolute right-1/2 top-1/2 h-0.5 w-full -translate-y-1/2 ${isCompleted ? "bg-[#0aad0a]" : "bg-muted"
                                            }`}
                                    />
                                )}
                                <div
                                    className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${isCompleted || isCurrent
                                        ? "border-[#0aad0a] bg-[#0aad0a] text-white"
                                        : "border-muted bg-background text-muted-foreground"
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`absolute left-1/2 top-1/2 h-0.5 w-full -translate-y-1/2 ${isCompleted ? "bg-[#0aad0a]" : "bg-muted"
                                            }`}
                                    />
                                )}
                            </div>
                            <p
                                className={`mt-2 text-center text-xs sm:text-sm ${isCurrent ? "font-semibold" : "text-muted-foreground"}`}
                            >
                                {step.label}
                            </p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
