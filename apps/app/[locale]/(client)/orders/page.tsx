import { ArrowLeftIcon, ClockIcon, MapPinIcon } from "@/components/Icons"
import { OrderStatusBadge } from "@/components/client/orders/OrderStatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getServerT } from "@/i18n/server-translations"
import { getUserTokens } from "@/lib/firebase-client/server-firebase-utils"
import { formatOrderId } from "@/lib/orders-utils"
import { prisma } from "@/lib/prisma"
import { OrderItem, OrderStatus, Prisma } from "@prisma/client"

import { OptimizedImage } from "@/components/ClsOptimization"
import Link from "next/link"
import { Suspense } from "react"

type IOrder = Prisma.OrderGetPayload<{
     include: {
          items: {
               include: {
                    product: {
                         include: {
                              images: {
                                   take: 1,
                              },
                         },
                    },
               },
          },
          merchant: {
               select: {
                    businessName: true,
                    id: true,
               },
          },
     }
}>

// Server-side data fetching with caching
async function getOrders(userId: string): Promise<IOrder[]> {
     "use server"

     const orders = await prisma.order.findMany({
          where: { userId },
          include: {
               items: {
                    include: {
                         product: {
                              include: {
                                   images: {
                                        take: 1,
                                   },
                              },
                         },
                    },
               },
               merchant: {
                    select: {
                         businessName: true,
                         id: true,
                    },
               },
          },
          orderBy: {
               createdAt: "desc",
          },
     })

     return orders
}

// Separate active and completed orders
function categorizeOrders(orders: IOrder[]) {
     const activeStatuses = [
          OrderStatus.PENDING,
          OrderStatus.ACCEPTED_BY_MERCHANT,
          OrderStatus.ACCEPTED_BY_DRIVER,
          OrderStatus.ON_THE_WAY,
          OrderStatus.IN_PREPARATION,
          OrderStatus.READY_TO_DELIVER,
     ]

     const active = orders.filter((order) => activeStatuses.some((e) => e === order.status))
     const history = orders.filter((order) => !activeStatuses.some((e) => e === order.status))

     return { active, history }
}

// Order card component
async function OrderCard({ order }: { order: IOrder }) {

     const t = await getServerT()
     const itemCount = order.items.reduce((sum: number, item: OrderItem) => sum + item.quantity, 0)

     return (
          <Link href={`/orders/${order.id}`}>
               <Card className="transition-shadow hover:shadow-md">
                    <CardHeader>
                         <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="flex-1">
                                   <CardTitle className="mb-1 text-lg">
                                        {t("Order")} {formatOrderId(order.id)}
                                   </CardTitle>
                                   <p className="text-sm text-muted-foreground">{order.merchant.businessName}</p>
                                   <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                             <ClockIcon className="h-4 w-4" />
                                             <span>{t.formatDateTime(order.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                             <MapPinIcon className="h-4 w-4" />
                                             <span className="line-clamp-1">{order.deliveryInfo.additionalNotes}</span>
                                        </div>
                                   </div>
                              </div>
                              <OrderStatusBadge status={order.status} />
                         </div>
                    </CardHeader>

                    <CardContent>
                         <div className="flex items-center justify-between">
                              <div className="flex -space-x-2">
                                   {order.items.slice(0, 3).map((item: IOrder["items"][number], idx: number) => (
                                        <div
                                             key={item.id}
                                             className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-background"
                                             style={{ zIndex: 3 - idx }}
                                        >
                                             <OptimizedImage
                                                  src={item.product.images[0]?.url || "/placeholder.png"}
                                                  alt={item.product.title}
                                                  fill
                                                  className="object-cover"
                                             />
                                        </div>
                                   ))}
                                   {order.items.length > 3 && (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                                             +{order.items.length - 3}
                                        </div>
                                   )}
                              </div>
                              <div className="text-right">
                                   <p className="text-sm text-muted-foreground">
                                        {itemCount} {itemCount === 1 ? t("item") : t("items")}
                                   </p>
                                   <p className="text-lg font-bold text-primary">
                                        {t.formatAmount(order.orderPrices.total)}
                                   </p>
                              </div>
                         </div>
                    </CardContent>
               </Card>
          </Link>
     )
}

// Loading skeleton
function OrdersSkeleton() {
     return (
          <div className="space-y-4">
               {[1, 2, 3].map((i) => (
                    <Card key={i}>
                         <CardHeader>
                              <Skeleton className="h-6 w-32" />
                              <Skeleton className="h-4 w-48" />
                         </CardHeader>
                         <CardContent>
                              <Skeleton className="h-16 w-full" />
                         </CardContent>
                    </Card>
               ))}
          </div>
     )
}

// Orders list component
async function OrdersList({ userId }: { userId: string }) {

     const t = await getServerT()
     const orders = await getOrders(userId)
     const { active, history } = categorizeOrders(orders)

     if (orders.length === 0) {
          return (
               <div className="py-16 text-center">
                    <div className="mb-6 flex justify-center">
                         <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                              <svg
                                   className="h-12 w-12 text-muted-foreground"
                                   fill="none"
                                   viewBox="0 0 24 24"
                                   stroke="currentColor"
                              >
                                   <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                   />
                              </svg>
                         </div>
                    </div>
                    <h2 className="mb-2 text-2xl font-bold">{t("No orders yet")}</h2>
                    <p className="mb-6 text-muted-foreground">
                         {t("Start shopping to place your first order")}
                    </p>
                    <Link href="/stores">
                         <Button className="bg-primary hover:bg-[#089808]">{t("Start Shopping")}</Button>
                    </Link>
               </div>
          )
     }

     return (
          <Tabs defaultValue="active" className="w-full">
               <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="active">
                         {t("Active")} ({active.length})
                    </TabsTrigger>
                    <TabsTrigger value="history">
                         {t("History")} ({history.length})
                    </TabsTrigger>
               </TabsList>

               <TabsContent value="active" className="mt-6">
                    {active.length === 0 ? (
                         <div className="py-12 text-center">
                              <p className="text-muted-foreground">{t("No active orders")}</p>
                         </div>
                    ) : (
                         <div className="flex flex-col gap-4">
                              {active.map((order) => (
                                   <OrderCard key={order.id} order={order} />
                              ))}
                         </div>
                    )}
               </TabsContent>

               <TabsContent value="history" className="mt-6">
                    {history.length === 0 ? (
                         <div className="py-12 text-center">
                              <p className="text-muted-foreground">{t("No order history")}</p>
                         </div>
                    ) : (
                         <div className="flex flex-col gap-4">
                              {history.map((order) => (
                                   <OrderCard key={order.id} order={order} />
                              ))}
                         </div>
                    )}
               </TabsContent>
          </Tabs>
     )
}

// Main page component
export default async function OrdersPage() {
     const token = await getUserTokens()

     const t = await getServerT()

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
                                   <Button className="bg-primary hover:bg-[#089808]">{t("Sign In")}</Button>
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
          return (
               <div className="min-h-screen bg-background">
                    <main className="container mx-auto px-4 py-6">
                         <div className="py-16 text-center">
                              <h2 className="mb-2 text-2xl font-bold">{t("User Not Found")}</h2>
                              <p className="mb-6 text-muted-foreground">
                                   {t("Please contact support if this issue persists")}
                              </p>
                              <Link href="/">
                                   <Button className="bg-primary hover:bg-[#089808]">{t("Go Home")}</Button>
                              </Link>
                         </div>
                    </main>
               </div>
          )
     }

     return (
          <div className="min-h-screen bg-background">
               <main className="container mx-auto px-4 py-6">
                    <Link href="/">
                         <Button variant="ghost" className="mb-4 gap-2">
                              <ArrowLeftIcon className="h-4 w-4" />
                              {t("Back to Home")}
                         </Button>
                    </Link>

                    <h1 className="mb-6 text-3xl font-bold">{t("Your Orders")}</h1>

                    <Suspense fallback={<OrdersSkeleton />}>
                         <OrdersList userId={user.id} />
                    </Suspense>
               </main>
          </div>
     )
}

// Enable caching for production
export const revalidate = 60