import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, MapPinIcon, ClockIcon } from "@/components/Icons"
import Link from "next/link"
import Image from "next/image"
import Navbar from "@/components/Navbar"
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge"
import { OrderTimeline } from "@/components/orders/OrderTimeline"
import { OrderStatus } from "@prisma/client"
import { getUserTokens } from "@/lib/firebase-client/firebase-utils"
import { prisma } from "@/lib/prisma"

export default async function OrdersPage() {
    const token = await getUserTokens();
    if (!token?.decodedToken?.uid) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="container mx-auto px-4 py-6">
                    <div className="py-16 text-center">
                        <h2 className="mb-2 text-2xl font-bold">Authentication Required</h2>
                        <p className="mb-6 text-muted-foreground">Please sign in to view your orders </p>
                        <Link href="/sign-in">
                            <Button className="bg-[#0aad0a] hover:bg-[#089808]">Sign In</Button>
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    // First find the user by Firebase UID
    const user = await prisma?.user.findUnique({
        where: {
            authId: token?.decodedToken?.uid,
        },
    });

    if (!user) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="container mx-auto px-4 py-6">
                    <div className="py-16 text-center">
                        <h2 className="mb-2 text-2xl font-bold">User Not Found</h2>
                        <p className="mb-6 text-muted-foreground">Please contact support if this issue persists</p>
                        <Link href="/">
                            <Button className="bg-[#0aad0a] hover:bg-[#089808]">Go Home</Button>
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const orders = await prisma?.order.findMany({
        where: {
            userId: user.id,
        },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            media: true,
                        },
                    },
                },
            },
        },
    })


    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-4 py-6">
                <Link href="/">
                    <Button variant="ghost" className="mb-4 gap-2">
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back to Home
                    </Button>
                </Link>

                <h1 className="mb-6 text-3xl font-bold">Your Orders</h1>

                <div className="space-y-6">
                    {orders?.map((order) => (
                        <Card key={order.id}>
                            <CardHeader>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <CardTitle className="mb-2">Order {order.id}</CardTitle>
                                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <ClockIcon className="h-4 w-4" />
                                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPinIcon className="h-4 w-4" />
                                                <span>{order.deliveryInfo.address}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <OrderStatusBadge status={order.status} />
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                {order.status !== OrderStatus.PENDING && (
                                    <div className="rounded-lg bg-muted/50 p-6">
                                        <OrderTimeline status={order.status} />
                                    </div>
                                )}

                                <div>
                                    <h3 className="mb-3 font-semibold">Items ({order.items.length})</h3>
                                    <div className="space-y-3">
                                        {order.items.map((item) => (
                                            <div key={item.product.id} className="flex items-center gap-4">
                                                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                                                    <Image
                                                        src={item.product.media.blurDataUrl || item.product.media.url}
                                                        alt={item.product.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{item.product.title}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Qty: {item.quantity} × ${item.product.price.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="font-semibold text-[#0aad0a]">
                                                    ${(item.product.price * item.quantity).toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t pt-4">
                                    <span className="text-lg font-semibold">Total</span>
                                    <span className="text-xl font-bold text-[#0aad0a]">${order.orderPrices.total.toFixed(2)}</span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Button variant="outline" className="flex-1 bg-transparent">
                                        View Receipt
                                    </Button>
                                    {order.status === OrderStatus.COMPLETED && (
                                        <Button className="flex-1 bg-[#0aad0a] hover:bg-[#089808]">Reorder</Button>
                                    )}
                                    {order.status === OrderStatus.ON_THE_WAY && (
                                        <Button className="flex-1 bg-[#0aad0a] hover:bg-[#089808]">Track Driver</Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {orders?.length === 0 && (
                    <div className="py-16 text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                                <svg className="h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                            </div>
                        </div>
                        <h2 className="mb-2 text-2xl font-bold">No orders yet</h2>
                        <p className="mb-6 text-muted-foreground">Start shopping to place your first order</p>
                        <Link href="/">
                            <Button className="bg-[#0aad0a] hover:bg-[#089808]">Start Shopping</Button>
                        </Link>
                    </div>
                )}
            </main>
        </div>
    )
}
