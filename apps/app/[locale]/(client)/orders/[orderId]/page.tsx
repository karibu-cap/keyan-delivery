import { ArrowLeftIcon, ClockIcon, MapPinIcon } from "@/components/Icons"
import { OrderActions } from "@/components/client/orders/OrderActions"
import { OrderStatusBadge } from "@/components/client/orders/OrderStatusBadge"
import { OrderTimeline } from "@/components/client/orders/OrderTimeline"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getT } from "@/i18n/server-translations"
import { getUserTokens } from "@/lib/firebase-client/server-firebase-utils"
import { formatOrderId } from "@/lib/orders-utils"
import { prisma } from "@/lib/prisma"
import { ROUTES } from "@/lib/router"
import { OrderStatus } from "@prisma/client"
import { PhoneIcon } from "lucide-react"
import { getLocale } from "next-intl/server"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"



// Server-side data fetching with caching
async function getOrderDetail(orderId: string, userId: string) {
     "use server"

     const order = await prisma.order.findFirst({
          where: {
               id: orderId,
               userId,
          },
          include: {
               items: {
                    include: {
                         product: {
                              include: {
                                   images: true,
                              },
                         },
                    },
               },
               merchant: {
                    select: {
                         id: true,
                         businessName: true,
                         phone: true,
                         address: true,
                    },
               },
               deliveryZone: true,
               payment: {
                    select: {
                         gateway: true,
                         status: true,
                    },
               },
          },
     })

     return order
}

// Check if order can be tracked
function canTrackOrder(status: OrderStatus): boolean {
     return [
          OrderStatus.PENDING,
          OrderStatus.ACCEPTED_BY_MERCHANT,
          OrderStatus.ACCEPTED_BY_DRIVER,
          OrderStatus.ON_THE_WAY,
          OrderStatus.IN_PREPARATION,
          OrderStatus.READY_TO_DELIVER,
     ].some((e) => e == status)
}

export default async function OrderDetailPage(props: { params: Promise<{ orderId: string }> }) {
     const params = await props.params;

     const token = await getUserTokens()
     const locale = await getLocale()
     const t = await getT(locale)

     if (!token?.decodedToken?.uid) {
          return (
               <div className="min-h-screen bg-background">
                    <main className="container mx-auto px-4 py-6">
                         <div className="py-16 text-center">
                              <h2 className="mb-2 text-2xl font-bold">{t("Authentication Required")}</h2>
                              <p className="mb-6 text-muted-foreground">
                                   {t("Please sign in to view your orders")}
                              </p>
                              <Link href="/sign-in">
                                   <Button className="bg-[#0aad0a] hover:bg-[#089808]">{t("Sign In")}</Button>
                              </Link>
                         </div>
                    </main>
               </div>
          )
     }

     const user = await prisma.user.findUnique({
          where: { authId: token.decodedToken.uid },
          select: { id: true },
     })

     if (!user) {
          notFound()
     }

     const order = await getOrderDetail(params.orderId, user.id)

     if (!order) {
          notFound()
     }

     const showTracking = canTrackOrder(order.status)

     return (
          <div className="min-h-screen bg-background">
               <main className="container mx-auto max-w-4xl px-4 py-6">
                    <Link href={ROUTES.orders} aria-label="Back to Orders">
                         <Button variant="ghost" className="mb-4 gap-2">
                              <ArrowLeftIcon className="h-4 w-4" />
                              {t("Back to Orders")}
                         </Button>
                    </Link>

                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                         <div>
                              <h1 className="text-3xl font-bold">
                                   {t("Order")} {formatOrderId(order.id)}
                              </h1>
                              <p className="mt-1 text-muted-foreground">
                                   {t("Placed on")} {new Date(order.createdAt).toLocaleDateString(locale, {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                   })}
                              </p>
                         </div>
                         <OrderStatusBadge status={order.status} />
                    </div>

                    {/* Order Timeline */}
                    {order.status !== OrderStatus.PENDING && (
                         <Card className="mb-6">
                              <CardHeader>
                                   <CardTitle>{t("Order Status")}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                   <OrderTimeline status={order.status} locale={locale} />
                              </CardContent>
                         </Card>
                    )}

                    {/* Track Order Button */}
                    {showTracking && (
                         <Link href={`/orders/${order.id}/track`} className="mb-6 block">
                              <Button className="w-full bg-[#0aad0a] hover:bg-[#089808]" size="lg">
                                   <MapPinIcon className="mr-2 h-5 w-5" />
                                   {t("Track Order")}
                              </Button>
                         </Link>
                    )}

                    <div className="grid gap-6 lg:grid-cols-3">
                         {/* Main Content */}
                         <div className="space-y-6 lg:col-span-2">
                              {/* Items */}
                              <Card>
                                   <CardHeader>
                                        <CardTitle>
                                             {t("Items")} ({order.items.length})
                                        </CardTitle>
                                   </CardHeader>
                                   <CardContent>
                                        <div className="space-y-4">
                                             {order.items.map((item) => (
                                                  <div key={item.id}>
                                                       <div className="flex items-center gap-4">
                                                            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                                                                 <Image
                                                                      src={item.product.images[0]?.url || "/placeholder.png"}
                                                                      alt={item.product.title}
                                                                      fill
                                                                      blurDataURL={item.product.images[0]?.blurDataUrl ?? ""}
                                                                      className="object-cover"
                                                                 />
                                                            </div>
                                                            <div className="flex-1">
                                                                 <p className="font-medium">{item.product.title}</p>
                                                                 <p className="text-sm text-muted-foreground">
                                                                      {t("Quantity")}: {item.quantity}
                                                                 </p>
                                                                 <p className="text-sm text-muted-foreground">
                                                                      ${item.price.toFixed(2)} {t("each")}
                                                                 </p>
                                                            </div>
                                                            <div className="text-right">
                                                                 <p className="font-semibold text-[#0aad0a]">
                                                                      ${(item.price * item.quantity).toFixed(2)}
                                                                 </p>
                                                            </div>
                                                       </div>
                                                       <Separator className="mt-4" />
                                                  </div>
                                             ))}
                                        </div>

                                        {/* Price Breakdown */}
                                        <div className="mt-6 space-y-2">
                                             <div className="flex justify-between text-sm">
                                                  <span className="text-muted-foreground">{t("Subtotal")}</span>
                                                  <span>${order.orderPrices.subtotal.toFixed(2)}</span>
                                             </div>
                                             <div className="flex justify-between text-sm">
                                                  <span className="text-muted-foreground">{t("Delivery Fee")}</span>
                                                  <span>${order.orderPrices.deliveryFee.toFixed(2)}</span>
                                             </div>
                                             {order.orderPrices.discount > 0 && (
                                                  <div className="flex justify-between text-sm text-green-600">
                                                       <span>{t("Discount")}</span>
                                                       <span>-${order.orderPrices.discount.toFixed(2)}</span>
                                                  </div>
                                             )}
                                             <Separator />
                                             <div className="flex justify-between text-lg font-bold">
                                                  <span>{t("Total")}</span>
                                                  <span className="text-[#0aad0a]">
                                                       ${order.orderPrices.total.toFixed(2)}
                                                  </span>
                                             </div>
                                        </div>
                                   </CardContent>
                              </Card>

                              {/* Delivery Codes */}
                              {(order.deliveryCode) && (
                                   <Card>
                                        <CardHeader>
                                             <CardTitle>{t("Verification Codes")}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                             {order.deliveryCode && (
                                                  <div>
                                                       <p className="mb-1 text-sm text-muted-foreground">{t("Delivery Code")}</p>
                                                       <p className="text-2xl font-mono font-bold tracking-wider">
                                                            {order.deliveryCode}
                                                       </p>
                                                  </div>
                                             )}
                                        </CardContent>
                                   </Card>
                              )}
                         </div>

                         {/* Sidebar */}
                         <div className="space-y-6">
                              {/* Delivery Information */}
                              <Card>
                                   <CardHeader>
                                        <CardTitle>{t("Delivery Information")}</CardTitle>
                                   </CardHeader>
                                   <CardContent className="space-y-4">
                                        <div>
                                             <div className="mb-2 flex items-start gap-2">
                                                  <MapPinIcon className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                                  <div>
                                                       <p className="font-medium">{t("Address")}</p>
                                                       <p className="text-sm text-muted-foreground">
                                                            {order.deliveryInfo.address}
                                                       </p>
                                                  </div>
                                             </div>
                                        </div>

                                        {order.deliveryInfo.deliveryContact && (
                                             <div>
                                                  <div className="flex items-start gap-2">
                                                       <PhoneIcon className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                                       <div>
                                                            <p className="font-medium">{t("Contact")}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                 {order.deliveryInfo.deliveryContact}
                                                            </p>
                                                       </div>
                                                  </div>
                                             </div>
                                        )}

                                        {order.deliveryInfo.additionalNotes && (
                                             <div>
                                                  <p className="mb-1 font-medium">{t("Notes")}</p>
                                                  <p className="text-sm text-muted-foreground">
                                                       {order.deliveryInfo.additionalNotes}
                                                  </p>
                                             </div>
                                        )}

                                        {order.deliveryInfo.estimatedDelivery && (
                                             <div>
                                                  <div className="flex items-start gap-2">
                                                       <ClockIcon className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                                       <div>
                                                            <p className="font-medium">{t("Estimated Delivery")}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                 {new Date(order.deliveryInfo.estimatedDelivery).toLocaleString(locale)}
                                                            </p>
                                                       </div>
                                                  </div>
                                             </div>
                                        )}
                                   </CardContent>
                              </Card>

                              {/* Merchant Information */}
                              <Card>
                                   <CardHeader>
                                        <CardTitle>{t("Merchant")}</CardTitle>
                                   </CardHeader>
                                   <CardContent className="space-y-3">
                                        <div>
                                             <p className="font-medium">{order.merchant.businessName}</p>
                                        </div>
                                        {order.merchant.phone && (
                                             <div className="flex items-center gap-2">
                                                  <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                                                  <a
                                                       href={`tel:${order.merchant.phone}`}
                                                       className="text-sm text-[#0aad0a] hover:underline"
                                                  >
                                                       {order.merchant.phone}
                                                  </a>
                                             </div>
                                        )}
                                   </CardContent>
                              </Card>

                              {/* Payment Information */}
                              {order.payment && (
                                   <Card>
                                        <CardHeader>
                                             <CardTitle>{t("Payment")}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                             <div className="space-y-2">
                                                  <div className="flex justify-between text-sm">
                                                       <span className="text-muted-foreground">{t("Method")}</span>
                                                       <span className="capitalize">{order.payment.gateway}</span>
                                                  </div>
                                                  <div className="flex justify-between text-sm">
                                                       <span className="text-muted-foreground">{t("Status")}</span>
                                                       <span className="capitalize">{order.payment.status}</span>
                                                  </div>
                                             </div>
                                        </CardContent>
                                   </Card>
                              )}
                         </div>
                    </div>

                    {/* Actions */}
                    <Card className="mt-6">
                         <CardContent className="pt-6">
                              <OrderActions
                                   orderId={order.id}
                                   status={order.status}
                              />
                         </CardContent>
                    </Card>
               </main>
          </div>
     )
}

// Enable caching for production
export const revalidate = 30 // Revalidate every 30 seconds

// Generate static params for common orders (optional)
export async function generateStaticParams() {
     // Generate static pages for recent orders
     const recentOrders = await prisma.order.findMany({
          where: {
               createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
               },
          },
          select: {
               id: true,
          },
          take: 100,
     })

     return recentOrders.map((order) => ({
          orderId: order.id,
     }))
}