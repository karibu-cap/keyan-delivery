import { OrderStatus } from "@prisma/client"
import { CheckIcon, PackageIcon, TruckIcon, HomeIcon } from "lucide-react"

interface OrderTimelineProps {
     status: OrderStatus
     locale?: string
}

// Server-side translation function
function getTranslatedText(key: string, locale: string = 'en'): string {
     const translations: Record<string, Record<string, string>> = {
          en: {
               "Order Confirmed": "Order Confirmed",
               "Preparing Order": "Preparing Order",
               "Out for Delivery": "Out for Delivery",
               "Delivered": "Delivered",
          },
          sw: {
               "Order Confirmed": "Agizo Limeidhinishwa",
               "Preparing Order": "Inatayarisha Agizo",
               "Out for Delivery": "Imetoka kwa Ajili ya Uwasilishaji",
               "Delivered": "Imewasilishwa",
          }
     };

     return translations[locale]?.[key] || key;
}

export function OrderTimeline({ status, locale = 'en' }: OrderTimelineProps) {
     const t = (key: string) => getTranslatedText(key, locale);

     const steps = [
          { id: OrderStatus.ACCEPTED_BY_MERCHANT, label: t("Order Confirmed"), icon: CheckIcon },
          { id: OrderStatus.IN_PREPARATION, label: t("Preparing Order"), icon: PackageIcon },
          { id: OrderStatus.ON_THE_WAY, label: t("Out for Delivery"), icon: TruckIcon },
          { id: OrderStatus.COMPLETED, label: t("Delivered"), icon: HomeIcon },
     ]

     const statusOrder = [OrderStatus.ACCEPTED_BY_MERCHANT, OrderStatus.IN_PREPARATION, OrderStatus.ON_THE_WAY, OrderStatus.COMPLETED] as OrderStatus[]
     const currentIndex = statusOrder.includes(status as OrderStatus) ? statusOrder.indexOf(status as OrderStatus) : -1

     const isCompletedStatus = (statusToCheck: OrderStatus, nextStatus: OrderStatus) => {
          if (statusToCheck === OrderStatus.ACCEPTED_BY_MERCHANT && [
               OrderStatus.IN_PREPARATION,
               OrderStatus.ACCEPTED_BY_DRIVER,
               OrderStatus.REJECTED_BY_MERCHANT,
               OrderStatus.REJECTED_BY_DRIVER,
               OrderStatus.CANCELED_BY_MERCHANT,
               OrderStatus.CANCELED_BY_DRIVER,
               OrderStatus.ON_THE_WAY,
               OrderStatus.IN_PREPARATION,
               OrderStatus.READY_TO_DELIVER,
               OrderStatus.COMPLETED
          ].some(e => e === nextStatus)) {
               return true
          }
          if (statusToCheck === OrderStatus.IN_PREPARATION && [
               OrderStatus.ACCEPTED_BY_DRIVER,
               OrderStatus.REJECTED_BY_MERCHANT,
               OrderStatus.REJECTED_BY_DRIVER,
               OrderStatus.CANCELED_BY_MERCHANT,
               OrderStatus.CANCELED_BY_DRIVER,
               OrderStatus.ON_THE_WAY,
               OrderStatus.READY_TO_DELIVER,
               OrderStatus.COMPLETED
          ].some(e => e === nextStatus)) {
               return true
          }
          if (statusToCheck === OrderStatus.READY_TO_DELIVER && [
               OrderStatus.ACCEPTED_BY_DRIVER,
               OrderStatus.REJECTED_BY_MERCHANT,
               OrderStatus.REJECTED_BY_DRIVER,
               OrderStatus.CANCELED_BY_MERCHANT,
               OrderStatus.CANCELED_BY_DRIVER,
               OrderStatus.ON_THE_WAY,
               OrderStatus.COMPLETED
          ].some(e => e === nextStatus)) {
               return true
          }
          if (statusToCheck === OrderStatus.ON_THE_WAY && [
               OrderStatus.COMPLETED
          ].some(e => e === nextStatus)) {
               return true
          }
          return false
     }

     return (
          <div className="relative">
               <div className="flex justify-between">
                    {steps.map((step, index) => {
                         const isCompleted = isCompletedStatus(step.id, status)
                         const isCurrent = index === currentIndex
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
