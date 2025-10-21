"use client";

import { useCart } from "@/hooks/use-cart";
import { IProduct } from "@/lib/actions/server/stores";
import {
    CheckCircle,
    ChevronRight,
    Heart,
    Minus,
    Package,
    Plus,
    Shield,
    Star,
    Truck,
    X,
    ZoomIn
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Badge } from "./badge";
import { Button } from "./button";
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "./dialog";
import { OptimizedImage } from "../ClsOptimization";

interface ProductModalProps {
    product: IProduct | null;
    isOpen: boolean;
    onClose: () => void;
}

interface WeightOption {
    value: number;
    label: string;
}

export const ProductModal = ({ product, isOpen, onClose }: ProductModalProps) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedWeight, setSelectedWeight] = useState<number | null>(null);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const { addItem } = useCart();

    const handleOpenChange = useCallback((open: boolean) => {
        if (!open) {
            setSelectedImageIndex(0);
            setQuantity(1);
            setSelectedWeight(null);
            onClose();
        }
    }, [onClose]);

    // Memoize weight options
    const weightOptions = useMemo<WeightOption[]>(() => {
        if (!product?.weight) return [];

        return [
            {
                value: product.weight * 0.75,
                label: `${(product.weight * 0.75).toFixed(2)} ${product.weightUnit}`
            },
            {
                value: product.weight,
                label: `${product.weight} ${product.weightUnit}`
            },
            {
                value: product.weight * 1.25,
                label: `${(product.weight * 1.25).toFixed(2)} ${product.weightUnit}`
            },
            {
                value: product.weight * 1.5,
                label: `${(product.weight * 1.5).toFixed(2)} ${product.weightUnit}`
            },
        ];
    }, [product?.weight, product?.weightUnit]);

    // Calculate current price
    const currentPrice = useMemo(() => {
        if (!product) return 0;
        if (selectedWeight && product.weight) {
            return (product.price / product.weight) * selectedWeight;
        }
        return product.price;
    }, [product, selectedWeight]);

    // Calculate savings
    const savings = useMemo(() => {
        if (!product?.compareAtPrice) return null;
        const amount = product.compareAtPrice - currentPrice;
        const percentage = ((amount / product.compareAtPrice) * 100).toFixed(0);
        return { amount, percentage };
    }, [product?.compareAtPrice, currentPrice]);

    const handleImageSelect = useCallback((index: number) => {
        setSelectedImageIndex(index);
    }, []);

    const handleQuantityChange = useCallback((delta: number) => {
        setQuantity(prev => Math.max(1, prev + delta));
    }, []);

    const handleWeightSelect = useCallback((value: number) => {
        setSelectedWeight(value);
    }, []);

    const handleAddToCart = useCallback(() => {
        if (!product) return;

        addItem({
            productId: product.id,
            quantity,
            price: currentPrice,
        });
        onClose();
    }, [product, quantity, currentPrice, addItem, onClose]);

    const toggleWishlist = useCallback(() => {
        setIsWishlisted(prev => !prev);
    }, []);

    if (!product) return null;

    const totalPrice = currentPrice * quantity;
    const currentImage = product.images[selectedImageIndex]?.url || product.images[0]?.url;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTitle className="sr-only">{product.title}</DialogTitle>
            <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
            <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden p-0 gap-0">
                <div className="grid md:grid-cols-[55%_45%] gap-0 h-full">
                    {/* Left: Image Section */}
                    <div className="relative bg-gradient-to-br from-gray-50 to-gray-100">
                        {/* Close Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 left-4 z-10 bg-white/90 hover:bg-white shadow-md"
                            onClick={() => handleOpenChange(false)}
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5" />
                        </Button>

                        {/* Main Image */}
                        <div className="relative aspect-square overflow-hidden">
                            <OptimizedImage
                                src={currentImage}
                                alt={`${product.title} - Image ${selectedImageIndex + 1}`}
                                fill
                                className="object-cover transition-opacity duration-300"
                                sizes="(max-width: 768px) 100vw, 55vw"
                                priority
                            />

                            {/* Zoom Icon */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute bottom-4 right-4 bg-white/90 hover:bg-white shadow-md"
                                aria-label="Zoom image"
                            >
                                <ZoomIn className="w-5 h-5" />
                            </Button>

                            {/* Badges Overlay */}
                            <div className="absolute top-4 right-4 space-y-2">
                                {product.badges?.includes('BEST_SELLER') && (
                                    <Badge variant="bestSeller" className="text-xs shadow-md">
                                        🏆 Best Seller
                                    </Badge>
                                )}
                                {product.badges?.includes('ORGANIC') && (
                                    <Badge variant="organic" className="text-xs shadow-md block">
                                        🌿 Organic
                                    </Badge>
                                )}
                                {savings && (
                                    <Badge className="bg-red-500 text-white text-xs shadow-md block">
                                        Save {savings.percentage}%
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail Gallery */}
                        {product.images && product.images.length > 1 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/20 to-transparent p-4">
                                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {product.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleImageSelect(index)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-3 transition-all duration-200 hover:scale-105 ${selectedImageIndex === index
                                                ? 'border-primary ring-2 ring-primary/50 shadow-lg'
                                                : 'border-white/50 hover:border-white shadow-md'
                                                }`}
                                            aria-label={`View image ${index + 1}`}
                                        >
                                            <OptimizedImage
                                                src={image.url}
                                                alt={`${product.title} thumbnail ${index + 1}`}
                                                width={80}
                                                height={80}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Content Section */}
                    <div className="flex flex-col overflow-y-auto max-h-[95vh]">
                        <div className="p-6 space-y-5">
                            {/* Header */}
                            <div>
                                <div className="flex items-start justify-between mb-3">
                                    <Badge variant="inStock" className="text-xs">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        In Stock
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={toggleWishlist}
                                        className="hover:bg-red-50"
                                        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                    >
                                        <Heart
                                            className={`w-5 h-5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'
                                                }`}
                                        />
                                    </Button>
                                </div>

                                <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                                    {product.title}
                                </h1>

                                <Button
                                    variant="link"
                                    className="text-sm p-0 h-auto text-primary hover:text-primary/80"
                                >
                                    Visit {product.merchant.businessName}
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>

                            {/* Rating */}
                            {product.rating && product.reviewCount && (
                                <div className="flex items-center space-x-2 pb-4 border-b border-gray-200">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < Math.floor(product.rating!)
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                        {product.rating.toFixed(1)}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        ({product.reviewCount} reviews)
                                    </span>
                                </div>
                            )}

                            {/* Pricing */}
                            <div className="space-y-3">
                                <div className="flex items-baseline space-x-3">
                                    <span className="text-4xl font-bold text-gray-900">
                                        ${currentPrice.toFixed(2)}
                                    </span>
                                    {product.compareAtPrice && (
                                        <>
                                            <span className="text-xl text-gray-400 line-through">
                                                ${product.compareAtPrice.toFixed(2)}
                                            </span>
                                            {savings && (
                                                <Badge variant="destructive" className="text-xs">
                                                    Save ${savings.amount.toFixed(2)}
                                                </Badge>
                                            )}
                                        </>
                                    )}
                                </div>
                                {product.weightUnit && (
                                    <p className="text-sm text-gray-600">
                                        Price per {product.weightUnit}
                                    </p>
                                )}
                            </div>

                            {/* Weight Selector */}
                            {weightOptions.length > 0 && (
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-900 block">
                                        Choose Size:
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {weightOptions.map((option) => (
                                            <Button
                                                key={option.value}
                                                variant={selectedWeight === option.value ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handleWeightSelect(option.value)}
                                                className={`justify-center font-medium transition-all ${selectedWeight === option.value
                                                    ? 'ring-2 ring-primary/50'
                                                    : 'hover:border-primary'
                                                    }`}
                                            >
                                                {option.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity Selector */}
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-900 block">
                                    Quantity:
                                </label>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="w-12 h-12 hover:bg-gray-50 rounded-none"
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={quantity <= 1}
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </Button>
                                        <span className="px-6 py-3 text-lg font-semibold min-w-[80px] text-center border-x-2 border-gray-200">
                                            {quantity}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="w-12 h-12 hover:bg-gray-50 rounded-none"
                                            onClick={() => handleQuantityChange(1)}
                                            aria-label="Increase quantity"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        Total: <span className="font-bold text-gray-900">${totalPrice.toFixed(2)}</span>
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3 pt-2">
                                <Button
                                    className="w-full bg-primary hover:bg-primary text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                                    onClick={handleAddToCart}
                                >
                                    Add to Cart • ${totalPrice.toFixed(2)}
                                </Button>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-3 pt-4">
                                <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg">
                                    <Truck className="w-5 h-5 text-primary mb-2" />
                                    <span className="text-xs font-medium text-gray-700">Free Delivery</span>
                                </div>
                                <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg">
                                    <Shield className="w-5 h-5 text-primary mb-2" />
                                    <span className="text-xs font-medium text-gray-700">100% Guarantee</span>
                                </div>
                                <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg">
                                    <Package className="w-5 h-5 text-primary mb-2" />
                                    <span className="text-xs font-medium text-gray-700">Secure Packaging</span>
                                </div>
                            </div>

                            {/* Product Description */}
                            {product.description && (
                                <div className="pt-4 border-t border-gray-200">
                                    <h3 className="font-semibold text-gray-900 mb-2">About this product</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {product.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};