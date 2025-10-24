import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useT } from "@/hooks/use-inline-translation";

interface ProductInfoProps {
    product: any;
}

export function ProductInfo({ product }: ProductInfoProps) {
    const t = useT();
    return (
        <div className="space-y-6">
            {/* Basic Information */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("Product Information")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">
                            {t("Description")}
                        </label>
                        <p className="mt-1 text-sm">{product.description}</p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                {t("Price")}
                            </label>
                            <p className="text-lg font-bold text-primary">
                                {t.formatAmount(product.price)}
                            </p>
                        </div>
                        {product.compareAtPrice && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    {t("Compare At Price")}
                                </label>
                                <p className="text-lg font-bold line-through text-muted-foreground">
                                    {t.formatAmount(product.compareAtPrice)}
                                </p>
                            </div>
                        )}
                    </div>

                    {product.unit && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                {t("Unit")}
                            </label>
                            <p className="mt-1">{product.unit}</p>
                        </div>
                    )}

                    {product.weight && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                {t("Weight")}
                            </label>
                            <p className="mt-1">
                                {product.weight} {product.weightUnit || "lb"}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("Inventory & Stock")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {product.inventory && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        {t("Available Quantity")}
                                    </label>
                                    <p className="text-lg font-bold">
                                        {product.inventory.quantity || 0}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        {t("Stock Quantity")}
                                    </label>
                                    <p className="text-lg font-bold">
                                        {product.inventory.stockQuantity || 0}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    {t("Low Stock Threshold")}
                                </label>
                                <p className="mt-1">
                                    {product.inventory.lowStockThreshold || 5}
                                </p>
                            </div>
                        </>
                    )}
                    {product.stock !== null && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                {t("Total Stock")}
                            </label>
                            <p className="text-lg font-bold">{product.stock}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Categories & Badges */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("Categories & Badges")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {product.categories && product.categories.length > 0 && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                {t("Categories")}
                            </label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {product.categories.map((cat: any) => (
                                    <Badge key={cat.id} variant="outline">
                                        {cat.category.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {product.badges && product.badges.length > 0 && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                {t("Product Badges")}
                            </label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {product.badges.map((badge: string) => (
                                    <Badge key={badge} className="bg-blue-100 text-blue-800">
                                        {badge.replace(/_/g, " ")}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* SEO Metadata */}
            {product.metadata && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t("SEO & Metadata")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                {t("SEO Title")}
                            </label>
                            <p className="mt-1 text-sm">
                                {product.metadata.seoTitle || "N/A"}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                {t("SEO Description")}
                            </label>
                            <p className="mt-1 text-sm">
                                {product.metadata.seoDescription || "N/A"}
                            </p>
                        </div>
                        {product.metadata.keywords &&
                            product.metadata.keywords.length > 0 && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        {t("Keywords")}
                                    </label>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {product.metadata.keywords.map((keyword: string) => (
                                            <Badge key={keyword} variant="secondary" className="text-xs">
                                                {keyword}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                    </CardContent>
                </Card>
            )}

            {/* Promotions */}
            {product.promotions && product.promotions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t("Active Promotions")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {product.promotions.map((promo: any) => (
                                <div
                                    key={promo.id}
                                    className="p-3 border rounded-lg bg-muted/50"
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium">{promo.title}</h4>
                                        <Badge
                                            variant={promo.isActive ? "default" : "secondary"}
                                        >
                                            {promo.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                    {promo.description && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {promo.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Timestamps */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("Timestamps")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("Created")}</span>
                        <span>{new Date(product.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("Last Updated")}</span>
                        <span>{new Date(product.updatedAt).toLocaleString()}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}