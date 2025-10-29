"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { OptimizedImage } from "@/components/ClsOptimization";
import { Package } from "lucide-react";
import { useT } from "@/hooks/use-inline-translation";
import type { IProduct } from "@/types/generic_types";

interface MerchantProductsProps {
    products: IProduct[];
}

export function MerchantProducts({ products }: MerchantProductsProps) {
    const t = useT()
    if (products.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">{t("No products yet")}</p>
                    <p className="text-sm text-muted-foreground">
                        {t("This merchant hasn't added any products")}
                    </p>
                </CardContent>
            </Card>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "VERIFIED":
                return "bg-green-100 text-green-800";
            case "WAITING_FOR_REVIEW":
                return "bg-orange-100 text-orange-800";
            case "REJECTED":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
                <Card key={product.id}>
                    <CardContent className="p-4">
                        <div className="space-y-3">
                            {/* Product Image */}
                            <div className="relative h-48 w-full rounded-lg overflow-hidden bg-muted">
                                {product.images[0]?.url ? (
                                    <OptimizedImage
                                        src={product.images[0].url}
                                        alt={product.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                        <Package className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div>
                                <h3 className="font-medium line-clamp-2">{product.title}</h3>
                                <p className="text-lg font-bold text-primary mt-1">
                                    {t.formatAmount(product.price)}
                                </p>
                            </div>

                            {/* Status Badges */}
                            <div className="flex flex-wrap gap-2">
                                <Badge className={getStatusColor(product.status)}>
                                    {product.status.replace(/_/g, " ")}
                                </Badge>
                                <Badge variant={product.visibility ? "default" : "secondary"}>
                                    {product.visibility ? "Visible" : "Hidden"}
                                </Badge>
                                {product.inventory !== null && (
                                    <Badge variant="outline">
                                        {t("Stock:")} {product.inventory?.stockQuantity}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}