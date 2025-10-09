"use client";

import { Minus, Plus, Star, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import Image from "next/image";
import { useCart } from "@/hooks/use-cart";
import { IProduct } from "@/lib/actions/stores";
import { useState } from "react";
import { motion } from "framer-motion";

interface MerchantProductProps {
    product: IProduct & {
        compareAtPrice?: number | null;
        rating?: number | null;
        reviewCount?: number | null;
        badges?: string[];
        images?: string[];
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

export const MerchantProduct = ({ product, index }: MerchantProductProps) => {
    const { cartItems, addItem, increaseQuantity, decreaseQuantity } = useCart();
    const [imageLoaded, setImageLoaded] = useState(false);

    const cartItem = cartItems.find(item => item.product.id === product.id);
    const quantity = cartItem?.quantity || 0;

    const hasPromotion = product.promotions && product.promotions.length > 0;
    const promotion = hasPromotion && product.promotions ? product.promotions[0] : null;

    return (
        <motion.div key={`${product.id}`}>        <div
            className="group h-full bg-white rounded-lg border border-gray-200 p-3 flex-shrink-0 hover:border-gray-300 hover:shadow-lg transition-all duration-200 animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="relative">
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                    <Image
                        src={product.media.url}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        onLoad={() => setImageLoaded(true)}
                        blurDataURL={product.media.blurDataUrl ?? ''}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
                {/* Badge Overlay - Top Left */}
                {product.badges && product.badges.length > 0 && (
                    <div className="absolute top-2 left-2">
                        {product.badges.includes('BEST_SELLER') && (
                            <Badge variant="bestSeller" className="text-xs px-2 py-1">
                                Best seller
                            </Badge>
                        )}
                        {product.badges.includes('ORGANIC') && (
                            <Badge variant="organic" className="text-xs px-2 py-1 mt-1">
                                Organic
                            </Badge>
                        )}
                    </div>
                )}

                {/* Add to Cart Button - Bottom Right */}
                {quantity === 0 ? (
                    <Button
                        variant="add"
                        className="absolute bottom-2 right-2"
                        onClick={() => addItem({
                            product: product,
                            quantity: 1,
                            price: product.price,
                        })}
                        disabled={(product.inventory?.stockQuantity ?? 0) < 1}
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                ) : (
                    <div className="absolute bottom-2 right-2 flex items-center bg-primary rounded-full">
                        <Button
                            variant="stepper"
                            size="stepper"
                            onClick={() => decreaseQuantity(product.id)}
                        >
                            <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-white font-medium min-w-[32px] text-center text-sm">
                            {quantity}
                        </span>
                        <Button
                            variant="stepper"
                            size="stepper"
                            onClick={() => increaseQuantity(product.id)}
                        >
                            <Plus className="w-3 h-3" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Promotional Banner */}
            {hasPromotion && promotion?.type === 'SPEND_X_SAVE_Y' && (
                <div className="bg-warning text-warning-foreground text-xs px-2 py-1 rounded-md mb-2 text-center">
                    Spend ${promotion.spendAmount}, save ${promotion.saveAmount}
                </div>
            )}

            {/* Product Name */}
            <h3 className="font-medium text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
                {product.title}
            </h3>

            {/* Size/Weight Info */}
            <p className="text-xs text-gray-600 mb-2">
                {product.weight && product.weightUnit
                    ? `${product.weight} ${product.weightUnit}`
                    : product.unit || '1 ct'
                }
            </p>

            {/* Price Section */}
            <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                </span>
                {product.compareAtPrice && (
                    <span className="text-sm text-gray-500 line-through">
                        ${product.compareAtPrice.toFixed(2)}
                    </span>
                )}
            </div>

            {/* Stock Indicator */}
            <div className="flex items-center space-x-1 mb-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-xs text-gray-600">
                    {(product.inventory?.stockQuantity ?? 0) > 10 ? 'Many in stock' : 'In stock'}
                </span>
            </div>

            {/* Rating */}
            {product.rating && product.reviewCount && (
                <div className="flex items-center space-x-1 mb-2">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-3 h-3 ${i < Math.floor(product.rating!)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-gray-600">
                        ({product.reviewCount})
                    </span>
                </div>
            )}

            {/* Promotional Link */}
            {hasPromotion && (
                <button className="text-xs text-primary hover:underline">
                    See eligible items
                </button>
            )}
        </div></motion.div>

    );
}