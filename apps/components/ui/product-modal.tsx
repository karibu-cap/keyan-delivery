"use client";

import { useState } from "react";
import { X, Plus, Minus, Heart, Bookmark, ZoomIn, Star, CheckCircle, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogOverlay } from "./dialog";
import Image from "next/image";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "./badge";
import { IProduct } from "@/lib/actions/stores";

interface ProductModalProps {
    product: IProduct | null;
    isOpen: boolean;
    onClose: () => void;
}

export const ProductModal = ({ product, isOpen, onClose }: ProductModalProps) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedWeight, setSelectedWeight] = useState<number | null>(null);
    const { addItem } = useCart();

    if (!product) return <div></div>;

    const weightOptions = product.weight ? [
        { value: product.weight * 0.75, label: `${(product.weight * 0.75).toFixed(2)} ${product.weightUnit}` },
        { value: product.weight, label: `${product.weight} ${product.weightUnit}` },
        { value: product.weight * 1.25, label: `${(product.weight * 1.25).toFixed(2)} ${product.weightUnit}` },
        { value: product.weight * 1.5, label: `${(product.weight * 1.5).toFixed(2)} ${product.weightUnit}` },
    ] : [];

    const currentPrice = selectedWeight && product.weight
        ? (product.price / product.weight) * selectedWeight
        : product.price;

    const handleAddToCart = () => {
        addItem({
            product: product,
            quantity,
            price: currentPrice,
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogOverlay className="bg-black/50" />
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
                <div className="grid md:grid-cols-2 gap-0">
                    {/* Image Section */}
                    <div className="relative bg-gray-50">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white"
                            onClick={onClose}
                        >
                            <X className="w-5 h-5" />
                        </Button>

                        {/* Main Image */}
                        <div className="relative aspect-square overflow-hidden">
                            <Image
                                src={product.images[0].url}
                                alt={product.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />

                            {/* Zoom Icon */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute bottom-4 right-4 bg-white/80 hover:bg-white"
                            >
                                <ZoomIn className="w-5 h-5" />
                            </Button>

                            {/* Badges Overlay */}
                            {product.badges && product.badges.length > 0 && (
                                <div className="absolute top-4 left-4 space-y-2">
                                    {product.badges.includes('BEST_SELLER') && (
                                        <Badge variant="bestSeller" className="text-xs">
                                            Best seller
                                        </Badge>
                                    )}
                                    {product.badges.includes('ORGANIC') && (
                                        <Badge variant="organic" className="text-xs block">
                                            Organic
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Images */}
                        {product.images && product.images.length > 1 && (
                            <div className="absolute bottom-4 left-4 right-4">
                                <div className="flex space-x-2 overflow-x-auto">
                                    {product.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${selectedImageIndex === index ? 'border-primary' : 'border-gray-200'
                                                }`}
                                        >
                                            <Image
                                                src={image.url}
                                                alt={`${product.title} ${index + 1}`}
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="p-6 overflow-y-auto max-h-[90vh]">
                        {/* Header */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="inStock" className="text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    In stock
                                </Badge>
                                <div className="flex items-center space-x-2">
                                    <Button variant="ghost" size="icon">
                                        <Heart className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon">
                                        <Bookmark className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                {product.title}
                            </h1>

                            <Button variant="link" className="text-sm p-0 h-auto text-primary">
                                Shop all {product.merchant.businessName}
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>

                        {/* Rating */}
                        {product.rating && product.reviewCount && (
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < Math.floor(product.rating!)
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600">
                                    {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                                </span>
                            </div>
                        )}

                        {/* Price and Weight Selector */}
                        <div className="mb-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <span className="text-3xl font-bold text-gray-900">
                                    ${currentPrice.toFixed(2)}
                                </span>
                                {product.compareAtPrice && (
                                    <span className="text-lg text-gray-500 line-through">
                                        ${product.compareAtPrice.toFixed(2)}
                                    </span>
                                )}
                                {product.weightUnit && (
                                    <span className="text-sm text-gray-600">
                                        / {product.weightUnit}
                                    </span>
                                )}
                            </div>

                            {/* Weight Selector */}
                            {weightOptions.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Choose size:
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {weightOptions.map((option) => (
                                            <Button
                                                key={option.value}
                                                variant={selectedWeight === option.value ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setSelectedWeight(option.value)}
                                                className="justify-start"
                                            >
                                                {option.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quantity Selector */}
                        <div className="mb-6">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Quantity:
                            </label>
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-12 h-12 rounded-l-lg"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </Button>
                                    <span className="px-4 py-3 text-lg font-medium min-w-[60px] text-center">
                                        {quantity}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-12 h-12 rounded-r-lg"
                                        onClick={() => setQuantity(quantity + 1)}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>


                        {/* Action Buttons */}
                        <div className="space-y-3 mb-6">
                            <Button
                                className="w-full bg-primary hover:bg-primary-dark text-white py-4 text-lg"
                                onClick={handleAddToCart}
                            >
                                Add to cart • ${(currentPrice * quantity).toFixed(2)}
                            </Button>

                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" className="flex items-center justify-center">
                                    <Heart className="w-4 h-4 mr-2" />
                                    Save
                                </Button>
                                <Button variant="outline" className="flex items-center justify-center">
                                    <Bookmark className="w-4 h-4 mr-2" />
                                    Add to Saved List
                                </Button>
                            </div>
                        </div>

                        {/* Satisfaction Guarantee */}
                        <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">✓</span>
                            </div>
                            <span>100% satisfaction guarantee</span>
                        </div>

                        {/* Customers Also Considered */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-4">Customers also considered</h3>
                            <div className="text-center text-gray-500 py-8">
                                <p>Related products carousel would go here</p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};