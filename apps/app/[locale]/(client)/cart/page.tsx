"use client"

import { OptimizedImage } from "@/components/ClsOptimization"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/hooks/use-cart"
import { useT } from "@/hooks/use-inline-translation"
import { ArrowLeftIcon, MinusIcon, PlusIcon, Trash2Icon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CartPage() {
    const t = useT()
    const { cart, updateQuantity, removeItem } = useCart()
    const router = useRouter()

    const deliveryFee = 0
    const serviceFee = 0
    const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)

    const finalTotal = total + deliveryFee + serviceFee

    if (cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-16">
                    <div className="mx-auto max-w-md text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                                <svg className="h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <h1 className="mb-2 text-2xl font-bold">{t("Your cart is empty")}</h1>
                        <p className="mb-6 text-muted-foreground">{t("Add items from a store to start shopping")}</p>
                        <Link href="/stores">
                            <Button className="bg-[#0aad0a] hover:bg-[#089808]">{t("Start Shopping")}</Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-6">
                <Link href="/stores">
                    <Button variant="ghost" className="mb-4 gap-2">
                        <ArrowLeftIcon className="h-4 w-4" />
                        {t("Continue Shopping")}
                    </Button>
                </Link>

                <h1 className="mb-6 text-3xl font-bold">{t("Your Cart")}</h1>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {cart.items.map((item) => (
                                        <div key={item.product.id} className="flex gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                                            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                                                <OptimizedImage
                                                    src={item.product.images[0].url || "/placeholder.svg"}
                                                    alt={item.product.title}
                                                    blurDataURL={item.product.images[0]?.blurDataUrl || undefined}
                                                    fill
                                                    className="object-cover"

                                                />
                                            </div>

                                            <div className="flex flex-1 flex-col justify-between">
                                                <div>
                                                    <h3 className="font-semibold">{item.product.title}</h3>
                                                    <p className="text-sm text-muted-foreground">{item.product.unit}</p>
                                                    {item.product.inventory?.stockQuantity && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.product.inventory.stockQuantity} {t("in stock")}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            className="h-8 w-8 bg-transparent"
                                                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <MinusIcon className="h-4 w-4" />
                                                        </Button>
                                                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                                        <Button
                                                            size="icon"
                                                            className="h-8 w-8 bg-[#0aad0a] hover:bg-[#089808]"
                                                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                            disabled={item.quantity >= (item.product.inventory?.stockQuantity || 0)}
                                                        >
                                                            <PlusIcon className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <span className="font-bold text-[#0aad0a]">
                                                            ${(item.price * item.quantity).toFixed(2)}
                                                        </span>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                                            onClick={() => removeItem(item.product.id)}
                                                        >
                                                            <Trash2Icon className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-20">
                            <CardContent className="p-6">
                                <h2 className="mb-4 text-xl font-bold">{t("Order Summary")}</h2>

                                <div className="space-y-3 border-b pb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{t("Subtotal", { count: totalItems })} {t("items")}</span>
                                        <span className="font-medium">${total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{t("Delivery Fee")}</span>
                                        <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{t("Service Fee")}</span>
                                        <span className="font-medium">${serviceFee.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between py-4 text-lg font-bold">
                                    <span>{t("Total")}</span>
                                    <span className="text-[#0aad0a]">${finalTotal.toFixed(2)}</span>
                                </div>

                                <Button
                                    className="w-full bg-[#0aad0a] hover:bg-[#089808]"
                                    size="lg"
                                    onClick={() => router.push("/checkout")}
                                >
                                    {t("Proceed to Checkout")}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}