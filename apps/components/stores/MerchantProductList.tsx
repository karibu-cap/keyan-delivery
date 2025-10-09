"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from 'date-fns'
import {
    Star,
    Clock,
    Search,
    ShoppingCart,
    ArrowLeft,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import Image from "next/image";
import { IMerchant } from "@/lib/actions/stores";
import { MerchantProduct } from "./MerchantProduct";

interface Aisle {
    id: string;
    name: string;
    count: number;
}

interface StoreDetailClientProps {
    initialStore: IMerchant;
    initialAisles: Aisle[];
}

const MerchantProductList = ({ initialStore, initialAisles }: StoreDetailClientProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const { cartItems, } = useCart();

    const { products } = initialStore;

    const filteredProducts = products?.filter((product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <div className="min-h-screen bg-background pb-32">
            <section className="relative h-64 overflow-hidden">
                <Image
                    src={initialStore.bannerUrl || '/placeholder.svg'}
                    alt={initialStore.businessName}
                    className="w-full h-full object-cover"
                    width={800}
                    height={256}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 container mx-auto max-w-7xl">
                    <Link
                        href="/stores"
                        className="inline-flex items-center text-foreground mb-4 hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to stores
                    </Link>

                    <h1 className="text-4xl font-bold mb-3 text-background">{initialStore.businessName}</h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-background">
                        <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 fill-warning text-warning" />
                            <span className="font-medium">{initialStore.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                        {initialStore.deliveryTime && <div className="flex items-center gap-1">
                            <Clock className="w-5 h-5" />
                            <span>{format(new Date(initialStore.deliveryTime), 'HH:mm')}</span>
                        </div>}
                        <Badge variant="secondary">{initialStore.isVerified ? 'Verified' : 'New'}</Badge>
                    </div>
                </div>
            </section>

            <section className="sticky top-16 z-40 bg-card border-y border-border py-3">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {initialAisles.map((aisle) => (
                            <button
                                key={aisle.id}
                                className="flex-shrink-0 px-4 py-2 rounded-2xl bg-accent hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium whitespace-nowrap"
                            >
                                {aisle.name} ({aisle.count})
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-6 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="relative max-w-xl">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 rounded-2xl"
                        />
                    </div>
                </div>
            </section>

            <section className="px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts.map((product, index) => {
                            return <MerchantProduct key={product.id} product={product} index={index} />
                        })}
                    </div>
                </div>
            </section>

            {totalItems > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50 animate-slide-up">
                    <div className="container mx-auto max-w-7xl px-4 py-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl gradient-hero flex items-center justify-center">
                                    <ShoppingCart className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="font-semibold">{totalItems} items</div>
                                    <div className="text-sm text-muted-foreground">
                                        ${total.toFixed(2)} total
                                    </div>
                                </div>
                            </div>

                            <Button
                                size="lg"
                                className="rounded-2xl shadow-primary px-8"
                                asChild
                            >
                                <Link href="/cart">
                                    View Cart & Checkout
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MerchantProductList;