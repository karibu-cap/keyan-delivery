"use client";

import { OptimizedImage } from "@/components/ClsOptimization";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { useT } from "@/hooks/use-inline-translation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    CheckCircle,
    Heart,
    MapPin,
    Minus,
    Package,
    Plus,
    Share2,
    ShoppingBag,
    Store,
    Truck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RelatedProducts } from "./RelatedProducts";

interface ProductDetailClientProps {
    product: any;
    relatedProducts: any[];
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
    const t = useT();
    const router = useRouter();
    const { cart, addItem, updateQuantity } = useCart();
    const [selectedImage, setSelectedImage] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);

    const quantity = cart.items.find((item) => item.product.id === product.id)?.quantity || 0;
    const stockQuantity = product.inventory?.stockQuantity ?? 0;
    const isInStock = stockQuantity > 0;

    const handleAddToCart = () => {
        addItem({
            productId: product.id,
            quantity: 1,
            price: product.price,
        });
    };

    const handleDecrease = () => {
        updateQuantity(product.id, quantity - 1);
    };

    const handleIncrease = () => {
        if (quantity < stockQuantity) {
            updateQuantity(product.id, quantity + 1);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.title,
                    text: product.description,
                    url: window.location.href,
                });
            } catch (error) {
                console.log("Error sharing:", error);
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
        }
    };

    const discount =
        product.compareAtPrice && product.compareAtPrice > product.price
            ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
            : 0;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Link href="/" className="hover:text-primary">
                            {t("Home")}
                        </Link>
                        <span>/</span>
                        <Link href="/stores" className="hover:text-primary">
                            {t("Stores")}
                        </Link>
                        <span>/</span>
                        <Link
                            href={`/stores/${product.merchant.slug}`}
                            className="hover:text-primary"
                        >
                            {product.merchant.businessName}
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium truncate">{product.title}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 lg:py-8">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    className="mb-4"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t("Back")}
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Image Gallery */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="overflow-hidden">
                            <CardContent className="p-0">
                                {/* Main Image */}
                                <div className="relative aspect-square bg-gray-100">
                                    <OptimizedImage
                                        src={product.images[selectedImage]?.url || "/placeholder.svg"}
                                        alt={product.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                    {discount > 0 && (
                                        <Badge
                                            variant="destructive"
                                            className="absolute top-4 left-4 text-lg px-3 py-1"
                                        >
                                            -{discount}%
                                        </Badge>
                                    )}
                                    <div className="absolute top-4 right-4 flex space-x-2">
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="rounded-full bg-white/90 hover:bg-white"
                                            onClick={() => setIsFavorite(!isFavorite)}
                                        >
                                            <Heart
                                                className={cn(
                                                    "w-5 h-5",
                                                    isFavorite && "fill-red-500 text-red-500"
                                                )}
                                            />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="rounded-full bg-white/90 hover:bg-white"
                                            onClick={handleShare}
                                        >
                                            <Share2 className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Thumbnail Gallery */}
                                {product.images.length > 1 && (
                                    <div className="p-4 bg-white">
                                        <div className="grid grid-cols-5 gap-2">
                                            {product.images.map((image: any, index: number) => (
                                                <button
                                                    key={image.id}
                                                    onClick={() => setSelectedImage(index)}
                                                    className={cn(
                                                        "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                                                        selectedImage === index
                                                            ? "border-primary"
                                                            : "border-gray-200 hover:border-gray-300"
                                                    )}
                                                >
                                                    <OptimizedImage
                                                        src={image.url}
                                                        alt={`${product.title} ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                        sizes="100px"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Product Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        {/* Store Info */}
                        <Link
                            href={`/stores/${product.merchant.slug}`}
                            className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:border-primary transition-colors"
                        >
                            {product.merchant.logoUrl ? (
                                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                                    <OptimizedImage
                                        src={product.merchant.logoUrl}
                                        alt={product.merchant.businessName}
                                        fill
                                        className="object-cover"
                                        sizes="48px"
                                    />
                                </div>
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Store className="w-6 h-6 text-primary" />
                                </div>
                            )}
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900">
                                    {product.merchant.businessName}
                                </p>
                                <p className="text-sm text-gray-600 flex items-center">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {product.merchant.address.city}
                                </p>
                            </div>
                        </Link>

                        <Card>
                            <CardContent className="p-6 space-y-4">
                                {/* Title */}
                                <div>
                                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                                        {product.title}
                                    </h1>
                                    {product.categories.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {product.categories.map((cat: any) => (
                                                <Badge key={cat.id} variant="secondary">
                                                    {cat.category.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                {/* Price */}
                                <div className="space-y-2">
                                    <div className="flex items-baseline space-x-3">
                                        <span className="text-3xl font-bold text-gray-900">
                                            ${product.price.toFixed(2)}
                                        </span>
                                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                                            <span className="text-xl text-gray-500 line-through">
                                                ${product.compareAtPrice.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                    {product.unit && (
                                        <p className="text-sm text-gray-600">
                                            {t("Per")} {product.unit}
                                        </p>
                                    )}
                                </div>

                                <Separator />

                                {/* Stock Status */}
                                <div className="flex items-center space-x-2">
                                    <CheckCircle
                                        className={cn(
                                            "w-5 h-5",
                                            isInStock ? "text-green-600" : "text-gray-300"
                                        )}
                                    />
                                    <span
                                        className={cn(
                                            "font-medium",
                                            isInStock ? "text-green-600" : "text-gray-500"
                                        )}
                                    >
                                        {stockQuantity > 10
                                            ? t("In Stock")
                                            : stockQuantity > 0
                                                ? `${t("Only")} ${stockQuantity} ${t("left")}`
                                                : t("Out of Stock")}
                                    </span>
                                </div>

                                {/* Add to Cart */}
                                {quantity === 0 ? (
                                    <Button
                                        size="lg"
                                        className="w-full"
                                        onClick={handleAddToCart}
                                        disabled={!isInStock}
                                    >
                                        <ShoppingBag className="w-5 h-5 mr-2" />
                                        {t("Add to Cart")}
                                    </Button>
                                ) : (
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center bg-primary rounded-lg">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleDecrease}
                                                className="text-white hover:bg-primary-dark"
                                            >
                                                <Minus className="w-5 h-5" />
                                            </Button>
                                            <span className="text-white font-bold px-6 text-lg">
                                                {quantity}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleIncrease}
                                                disabled={quantity >= stockQuantity}
                                                className="text-white hover:bg-primary-dark"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </Button>
                                        </div>
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => router.push("/cart")}
                                        >
                                            {t("View Cart")}
                                        </Button>
                                    </div>
                                )}

                                {/* Delivery Info */}
                                <div className="space-y-3 pt-4">
                                    <div className="flex items-start space-x-3 text-sm">
                                        <Truck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {t("Fast Delivery")}
                                            </p>
                                            <p className="text-gray-600">
                                                {t("Delivered within 30-60 minutes")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3 text-sm">
                                        <Package className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {t("Quality Guaranteed")}
                                            </p>
                                            <p className="text-gray-600">
                                                {t("Fresh and quality products")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Promotions */}
                        {product.promotions && product.promotions.length > 0 && (
                            <Card className="bg-amber-50 border-amber-200">
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-amber-900 mb-2">
                                        🎉 {t("Special Offers")}
                                    </h3>
                                    {product.promotions.map((promo: any) => (
                                        <div key={promo.id} className="text-sm text-amber-800">
                                            {promo.title}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                </div>

                {/* Product Description */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="mb-12"
                >
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                {t("Product Description")}
                            </h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {product.description}
                            </p>
                            {product.sku && (
                                <div className="mt-4 pt-4 border-t">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">{t("SKU")}:</span> {product.sku}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                    >
                        <RelatedProducts products={relatedProducts} />
                    </motion.div>
                )}
            </div>
        </div>
    );
}
