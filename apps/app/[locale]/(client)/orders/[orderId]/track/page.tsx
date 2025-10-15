"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, MapPinIcon, UserIcon } from "@/components/Icons"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { OrderStatusBadge } from "@/components/client/orders/OrderStatusBadge"
import { OrderTimeline } from "@/components/client/orders/OrderTimeline"
import { Skeleton } from "@/components/ui/skeleton"
import dynamic from "next/dynamic"
import { OrderStatus } from "@prisma/client"
import { PhoneIcon } from "lucide-react"
import { ROUTES } from "@/lib/router"
import { useT } from "@/hooks/use-inline-translation"

// Dynamically import map component to avoid SSR issues
const OrderMap = dynamic(() => import("@/components/client/orders/OrderMap"), {
     ssr: false,
     loading: () => <div className="h-[400px] rounded-lg bg-muted animate-pulse" />,
})

interface OrderTrackingData {
     id: string
     status: OrderStatus
     deliveryInfo: {
          address: string
          location?: {
               coordinates: [number, number]
          }
          estimatedDelivery?: string
     }
     merchant: {
          businessName: string
     }
     driver?: {
          name: string
          phone: string
          vehicleInfo?: string
          currentLocation?: {
               coordinates: [number, number]
          }
     }
     createdAt: string
     updatedAt: string
}

export default function OrderTrackPage() {
     const params = useParams()
     const orderId = params.orderId as string

     const [orderData, setOrderData] = useState<OrderTrackingData | null>(null)
     const [loading, setLoading] = useState(true)
     const [error, setError] = useState<string | null>(null)
     const router = useRouter();
     const t = useT()

     // Fetch order tracking data
     const fetchOrderTracking = useCallback(async () => {
          try {
               const response = await fetch(`/api/v1/orders/${orderId}/track`)

               if (!response.ok) {
                    if (response.status === 404) {
                         throw new Error("Order not found")
                    }
                    throw new Error("Failed to fetch order tracking")
               }

               const data = await response.json()
               setOrderData(data)
               setError(null)
          } catch (err) {
               setError(err instanceof Error ? err.message : "An error occurred")
               console.error("Error fetching order tracking:", err)
          } finally {
               setLoading(false)
          }
     }, [orderId])

     // Initial fetch
     useEffect(() => {
          fetchOrderTracking()
     }, [fetchOrderTracking])

     // Poll for updates every 30 seconds
     useEffect(() => {
          const interval = setInterval(() => {
               fetchOrderTracking()
          }, 30000)

          return () => clearInterval(interval)
     }, [fetchOrderTracking])

     if (loading) {
          return (
               <div className="min-h-screen bg-background">
                    <Navbar />
                    <main className="container mx-auto max-w-6xl px-4 py-6">
                         <Skeleton className="mb-4 h-10 w-32" />
                         <Skeleton className="mb-6 h-10 w-64" />
                         <div className="grid gap-6 lg:grid-cols-3">
                              <div className="lg:col-span-2">
                                   <Skeleton className="h-[400px] w-full rounded-lg" />
                              </div>
                              <div className="space-y-6">
                                   <Skeleton className="h-[200px] w-full" />
                                   <Skeleton className="h-[200px] w-full" />
                              </div>
                         </div>
                    </main>
               </div>
          )
     }

     if (error || !orderData) {
          return (
               <div className="min-h-screen bg-background">
                    <Navbar />
                    <main className="container mx-auto max-w-6xl px-4 py-6">
                         <div className="py-16 text-center">
                              <h2 className="mb-2 text-2xl font-bold">Error Loading Order</h2>
                              <p className="mb-6 text-muted-foreground">{error || "Order not found"}</p>
                              <Link href="/orders">
                                   <Button className="bg-[#0aad0a] hover:bg-[#089808]">Back to Orders</Button>
                              </Link>
                         </div>
                    </main>
               </div>
          )
     }

     const canDisplayMap = orderData.deliveryInfo.location?.coordinates && orderData.driver?.currentLocation?.coordinates && [OrderStatus.READY_TO_DELIVER, OrderStatus.ACCEPTED_BY_DRIVER, OrderStatus.ON_THE_WAY].some(e => e === orderData.status)

     return (
          <div className="min-h-screen bg-background">
               <Navbar />

               <main className="container mx-auto max-w-6xl px-4 py-6">
                    <Button variant="ghost" aria-label="Back to order" onClick={() => {
                         if (window.history.length > 1) {
                              window.history.back();
                         } else {
                              router.push(ROUTES.order(orderId));
                         }
                    }}>
                         <ArrowLeftIcon className="w-5 h-5" />
                         {t("Back to Order Details")}
                    </Button>

                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                         <div>
                              <h1 className="text-3xl font-bold">{t("Track Order")}</h1>
                              <p className="mt-1 text-muted-foreground">
                                   Order #{orderData.id.slice(0, 7)} from {orderData.merchant.businessName}
                              </p>
                         </div>
                         <OrderStatusBadge status={orderData.status} />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                         {/* Map Section */}
                         <div className="lg:col-span-2">
                              {canDisplayMap && <Card className="overflow-hidden">
                                   <CardContent className="p-0">
                                        <OrderMap
                                             deliveryLocation={orderData.deliveryInfo.location?.coordinates}
                                             driverLocation={orderData.driver?.currentLocation?.coordinates}
                                             merchantName={orderData.merchant.businessName}
                                        />
                                   </CardContent>
                              </Card>
                              }
                              {/* Timeline */}
                              <Card className="mt-6">
                                   <CardHeader>
                                        <CardTitle>{t("Order Progress")}</CardTitle>
                                   </CardHeader>
                                   <CardContent>
                                        <OrderTimeline status={orderData.status} />
                                   </CardContent>
                              </Card>
                         </div>

                         {/* Sidebar */}
                         <div className="space-y-6">
                              {/* Delivery Information */}
                              <Card>
                                   <CardHeader>
                                        <CardTitle>{t("Delivery Details")}</CardTitle>
                                   </CardHeader>
                                   <CardContent className="space-y-4">
                                        <div>
                                             <div className="mb-2 flex items-start gap-2">
                                                  <MapPinIcon className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                                  <div>
                                                       <p className="font-medium">{t("Delivery Address")}</p>
                                                       <p className="text-sm text-muted-foreground">
                                                            {orderData.deliveryInfo.address}
                                                       </p>
                                                  </div>
                                             </div>
                                        </div>

                                        {orderData.deliveryInfo.estimatedDelivery && (
                                             <div className="rounded-lg bg-muted p-3">
                                                  <p className="mb-1 text-sm font-medium">{t("Estimated Arrival")}</p>
                                                  <p className="text-lg font-bold text-[#0aad0a]">
                                                       {new Date(orderData.deliveryInfo.estimatedDelivery).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                       })}
                                                  </p>
                                             </div>
                                        )}
                                   </CardContent>
                              </Card>

                              {/* Driver Information */}
                              {orderData.driver && (
                                   <Card>
                                        <CardHeader>
                                             <CardTitle>{t("Driver Information")}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                             <div className="flex items-center gap-3">
                                                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0aad0a]/10">
                                                       <UserIcon className="h-6 w-6 text-[#0aad0a]" />
                                                  </div>
                                                  <div>
                                                       <p className="font-medium">{orderData.driver.name}</p>
                                                       {orderData.driver.vehicleInfo && (
                                                            <p className="text-sm text-muted-foreground">
                                                                 {orderData.driver.vehicleInfo}
                                                            </p>
                                                       )}
                                                  </div>
                                             </div>

                                             {orderData.driver.phone && (
                                                  <a href={`tel:${orderData.driver.phone}`}>
                                                       <Button variant="outline" className="w-full gap-2">
                                                            <PhoneIcon className="h-4 w-4" />
                                                            {t("Call Driver")}
                                                       </Button>
                                                  </a>
                                             )}
                                        </CardContent>
                                   </Card>
                              )}

                              {/* Live Updates Badge */}
                              <Card>
                                   <CardContent className="pt-6">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                             <div className="h-2 w-2 animate-pulse rounded-full bg-[#0aad0a]" />
                                             <span>{t("Updates every 30 seconds")}</span>
                                        </div>
                                   </CardContent>
                              </Card>
                         </div>
                    </div>
               </main>
          </div>
     )
}