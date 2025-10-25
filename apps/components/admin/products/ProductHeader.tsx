"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Eye, EyeOff, Store } from "lucide-react";
import {
    updateProduct,
} from "@/lib/actions/server/admin/products";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useT } from "@/hooks/use-inline-translation";
import { useAction } from "next-safe-action/hooks";
import type { IProduct } from "@/lib/actions/server/stores";
import { ProductStatus } from "@prisma/client";

interface ProductHeaderProps {
    product: IProduct;
}

export function ProductHeader({ product }: ProductHeaderProps) {
    const { toast } = useToast();
    const router = useRouter();
    const t = useT();


    const {
        execute: approve,
        isExecuting: isApproving,
    } = useAction(updateProduct, {
        onSuccess: () => {
            toast({
                title: t("Product approved"),
                description: t("The product has been verified and is now visible."),
            });
            router.refresh();
        },
        onError: ({ error }) => {
            if (error.serverError) {
                toast({
                    title: t("Cannot approve product"),
                    description: error.serverError,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: t("Error"),
                    description: t("Failed to approve product"),
                    variant: "destructive",
                });
            }
        },
    })

    const {
        execute: reject,
        isExecuting: isRejecting,
    } = useAction(updateProduct, {
        onSuccess: () => {
            toast({
                title: t("Product rejected"),
                description: t("The product has been rejected and hidden."),
                variant: "destructive",
            });
            router.refresh();
        },
        onError: ({ error }) => {
            if (error.serverError) {
                toast({
                    title: t("Cannot reject product"),
                    description: error.serverError,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: t("Error"),
                    description: t("Failed to reject product"),
                    variant: "destructive",
                });
            }
        },
    })

    const {
        execute: toggleVisibility,
        isExecuting: isTogglingVisibility,
    } = useAction(updateProduct, {
        onSuccess: () => {
            toast({
                title: t("Visibility updated"),
                description: t("Product visibility has been toggled."),
            });
            router.refresh();
        },
        onError: ({ error }) => {
            if (error.serverError) {
                toast({
                    title: t("Cannot update visibility"),
                    description: error.serverError,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: t("Error"),
                    description: t("Failed to update visibility"),
                    variant: "destructive",
                });
            }
        },
    })


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
                                <span className="ml-2 font-semibold">{product.rating.toFixed(2)}/5</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                        {(product.status === ProductStatus.WAITING_FOR_REVIEW || product.status === ProductStatus.REJECTED) && (
                            <>
                                <Button onClick={() => approve({ productId: product.id, action: "approve" })} disabled={isApproving}>
                                    <Check className="mr-2 h-4 w-4" />
                                    {isApproving ? t("Approving...") : t("Approve Product")}
                                </Button>
                                {product.status === ProductStatus.WAITING_FOR_REVIEW && (<Button
                                    variant="outline"
                                    onClick={() => reject({ productId: product.id, action: "reject" })}
                                    disabled={isRejecting}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    {isRejecting ? t("Rejecting...") : t("Reject")}
                                </Button>)}
                            </>
                        )}
                        {product.status === ProductStatus.VERIFIED && (
                            <Button
                                variant="outline"
                                onClick={() => reject({ productId: product.id, action: "reject" })}
                                disabled={isRejecting}
                            >
                                <X className="mr-2 h-4 w-4" />
                                {isRejecting ? t("Rejecting...") : t("Revoke Verification")}
                            </Button>
                        )}
                        {product.status === ProductStatus.VERIFIED && (<Button
                            variant="secondary"
                            onClick={() => toggleVisibility({ productId: product.id, action: "toggleVisibility" })}
                            disabled={isTogglingVisibility}
                        >
                            {product.visibility ? (
                                <>
                                    {<EyeOff className="mr-2 h-4 w-4" />}
                                    {isTogglingVisibility ? t("Hiding...") : t("Hide Product")}
                                </>
                            ) : (
                                <>
                                    <Eye className="mr-2 h-4 w-4" />
                                    {isTogglingVisibility ? t("Showing...") : t("Show Product")}
                                </>
                            )}
                        </Button>)}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}