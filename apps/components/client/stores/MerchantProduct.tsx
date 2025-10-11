"use client";

import { Minus, Plus, Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useCart } from "@/hooks/use-cart";
import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { IProduct } from "@/lib/actions/stores";

interface MerchantProductProps {
    product: IProduct & {
        compareAtPrice?: number | null;
        rating?: number | null;
        reviewCount?: number | null;
        badges?: string[];
        weight?: number | null;
        weightUnit?: string | null;
        promotions?: Array<{
            type: string;
            title: string;
            spendAmount?: number;
            saveAmount?: number;
        }>;
    };
    index: number;
}

export function MerchantProduct({ product, index }: MerchantProductProps) {
    const { cartItems, addItem, updateQuantity } = useCart();
    const [imageLoaded, setImageLoaded] = useState(false);

    const cartItem = useMemo(
        () => cartItems.find((item) => item.product.id === product.id),
        [cartItems, product.id]
    );

    const quantity = cartItem?.quantity || 0;
    const stockQuantity = product.inventory?.stockQuantity ?? 0;
    const isInStock = stockQuantity > 0;

    const promotion = useMemo(
        () => (product.promotions?.length ? product.promotions[0] : null),
        [product.promotions]
    );

    const handleAddToCart = useCallback(() => {
        addItem({
            product,
            quantity: 1,
            price: product.price,
        });
    }, [addItem, product]);

    const handleDecrease = useCallback(() => {
        updateQuantity(product.id, quantity - 1);
    }, [updateQuantity, product.id, quantity]);

    const handleIncrease = useCallback(() => {
        updateQuantity(product.id, quantity + 1);
    }, [updateQuantity, product.id, quantity]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            className="group h-full bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-xl transition-all duration-300"
        >
            <div className="relative">
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <Image
                        src={product.images[0].url}
                        alt={product.title}
                        fill
                        className={`object-cover transition-all duration-300 group-hover:scale-110 ${imageLoaded ? "opacity-100" : "opacity-0"
                            }`}
                        onLoad={() => setImageLoaded(true)}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        priority={index < 4}
                    />
                </div>

                {/* Badges */}
                {product.badges && product.badges.length > 0 && (
                    <div className="absolute top-2 left-2 space-y-1">
                        {product.badges.includes("BEST_SELLER") && (
                            <Badge variant="bestSeller" className="text-xs px-2 py-1 shadow-md">
                                🏆 Best seller
                            </Badge>
                        )}
                        {product.badges.includes("ORGANIC") && (
                            <Badge variant="organic" className="text-xs px-2 py-1 shadow-md">
                                🌿 Organic
                            </Badge>
                        )}
                    </div>
                )}

                {/* Cart Controls */}
                {quantity === 0 ? (
                    <Button
                        variant="add"
                        className="absolute bottom-2 right-2 shadow-lg"
                        onClick={handleAddToCart}
                        disabled={!isInStock}
                        aria-label={`Add ${product.title} to cart`}
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                ) : (
                    <div className="absolute bottom-2 right-2 flex items-center bg-primary rounded-full shadow-lg">
                        <Button
                            variant="stepper"
                            size="stepper"
                            onClick={handleDecrease}
                            aria-label="Decrease quantity"
                        >
                            <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-white font-medium min-w-[32px] text-center text-sm">
                            {quantity}
                        </span>
                        <Button
                            variant="stepper"
                            size="stepper"
                            onClick={handleIncrease}
                            aria-label="Increase quantity"
                        >
                            <Plus className="w-3 h-3" />
                        </Button>
                    </div>
                )}
            </div>

            <div className="p-3">
                {/* Promotional Banner */}
                {promotion?.type === "SPEND_X_SAVE_Y" && (
                    <div className="bg-amber-100 text-amber-900 text-xs px-2 py-1 rounded-md mb-2 text-center font-medium">
                        Spend ${promotion.spendAmount}, save ${promotion.saveAmount}
                    </div>
                )}

                {/* Product Name */}
                <h3 className="font-medium text-gray-900 text-sm leading-tight mb-1 line-clamp-2 min-h-[2.5rem]">
                    {product.title}
                </h3>

                {/* Size/Weight */}
                <p className="text-xs text-gray-600 mb-2">
                    {product.weight && product.weightUnit
                        ? `${product.weight} ${product.weightUnit}`
                        : product.unit || "1 ct"}
                </p>

                {/* Price */}
                <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg font-bold text-gray-900">
                        ${product.price.toFixed(2)}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <>
                            <span className="text-sm text-gray-500 line-through">
                                ${product.compareAtPrice.toFixed(2)}
                            </span>
                            <Badge variant="destructive" className="text-xs px-1 py-0">
                                {Math.round(
                                    ((product.compareAtPrice - product.price) /
                                        product.compareAtPrice) *
                                    100
                                )}
                                % off
                            </Badge>
                        </>
                    )}
                </div>

                {/* Stock */}
                <div className="flex items-center space-x-1 mb-2">
                    <CheckCircle
                        className={`w-4 h-4 ${isInStock ? "text-success" : "text-gray-300"}`}
                    />
                    <span className="text-xs text-gray-600">
                        {stockQuantity > 10
                            ? "Many in stock"
                            : stockQuantity > 0
                                ? "In stock"
                                : "Out of stock"}
                    </span>
                </div>

                {/* Rating */}
                {product.rating && product.reviewCount && (
                    <div className="flex items-center space-x-1">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < Math.floor(product.rating!)
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-gray-300"
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-gray-600">
                            ({product.reviewCount})
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}