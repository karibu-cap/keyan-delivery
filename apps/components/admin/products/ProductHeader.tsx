"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Eye, EyeOff, Store } from "lucide-react";
import { useState } from "react";
import {
    updateProduct,
} from "@/lib/actions/client/admin/products";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useT } from "@/hooks/use-inline-translation";

interface ProductHeaderProps {
    product: any;
}

export function ProductHeader({ product }: ProductHeaderProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const t = useT();

    const handleApprove = async () => {
        setLoading(true);
        try {
            const result = await updateProduct(product.id, 'approve');
            if (result.success) {
                toast({
                    title: t("Product approved"),
                    description: t("The product has been verified and is now visible."),
                });
                router.refresh();
            } else {
                toast({
                    title: t("Cannot approve product"),
                    description: result.error,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: t("Error"),
                description: t("Failed to approve product"),
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        setLoading(true);
        try {
            await updateProduct(product.id, 'reject');
            toast({
                title: t("Product rejected"),
                description: t("The product has been rejected and hidden."),
                variant: "destructive",
            });
            router.refresh();
        } catch (error) {
            toast({
                title: t("Error"),
                description: t("Failed to reject product"),
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleVisibility = async () => {
        setLoading(true);
        try {
            await updateProduct(product.id, 'toggleVisibility');
            toast({
                title: t("Visibility updated"),
                description: t("Product visibility has been toggled."),
            });
            router.refresh();
        } catch (error) {
            toast({
                title: t("Error"),
                description: t("Failed to update visibility"),
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "VERIFIED":
                return (
                    <Badge className="bg-green-100 text-green-800">{t("Verified")}</Badge>
                );
            case "WAITING_FOR_REVIEW":
                return (
                    <Badge className="bg-orange-100 text-orange-800">
                        {t("Pending Review")}
                    </Badge>
                );
            case "REJECTED":
                return <Badge className="bg-red-100 text-red-800">{t("Rejected")}</Badge>;
            case "DRAFT":
                return <Badge variant="secondary">{t("Draft")}</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <Card>
            <CardContent className="p-6">
                <div className="space-y-4">
                    {/* Title & Status */}
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-2xl font-bold">{product.title}</h2>
                            {getStatusBadge(product.status)}
                            <Badge variant={product.visibility ? "default" : "secondary"}>
                                {product.visibility ? t("Visible") : t("Hidden")}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <Store className="h-4 w-4" />
                            <Link
                                href={`/admin/merchants/${product.merchant.id}`}
                                className="hover:underline"
                            >
                                {product.merchant.businessName}
                            </Link>
                            {product.merchant.isVerified && (
                                <Badge variant="outline" className="text-xs">
                                    {t("Verified Merchant")}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-6 text-sm">
                        <div>
                            <span className="text-muted-foreground">{t("price")}:</span>
                            <span className="ml-2 font-semibold text-lg text-primary">
                                {t.formatAmount(product.price)}
                            </span>
                        </div>
                        {product.stock !== null && (
                            <div>
                                <span className="text-muted-foreground">{t("stock")}:</span>
                                <span className="ml-2 font-semibold">{product.stock}</span>
                            </div>
                        )}
                        {product.rating && (
                            <div>
                                <span className="text-muted-foreground">{t("Rating")}:</span>
                                <span className="ml-2 font-semibold">{product.rating}/5</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                        {product.status === "WAITING_FOR_REVIEW" && (
                            <>
                                <Button onClick={handleApprove} disabled={loading}>
                                    <Check className="mr-2 h-4 w-4" />
                                    {t("Approve Product")}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleReject}
                                    disabled={loading}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    {t("Reject")}
                                </Button>
                            </>
                        )}
                        {product.status === "VERIFIED" && (
                            <Button
                                variant="outline"
                                onClick={handleReject}
                                disabled={loading}
                            >
                                <X className="mr-2 h-4 w-4" />
                                {t("Revoke Verification")}
                            </Button>
                        )}
                        <Button
                            variant="secondary"
                            onClick={handleToggleVisibility}
                            disabled={loading}
                        >
                            {product.visibility ? (
                                <>
                                    <EyeOff className="mr-2 h-4 w-4" />
                                    {t("Hide Product")}
                                </>
                            ) : (
                                <>
                                    <Eye className="mr-2 h-4 w-4" />
                                    {t("Show Product")}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}