"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, MessageSquare, MapPin, Phone } from "lucide-react";
import { OptimizedImage } from "@/components/ClsOptimization";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";


import { useT } from "@/hooks/use-inline-translation";
import { toast } from "@/hooks/use-toast";
import { approveMerchant, rejectMerchant } from "@/lib/actions/server/admin/merchants";
import { MessageDialog } from "./MessageDialogue";

interface MerchantHeaderProps {
    merchant: any;
    stats: {
        activeProducts: number;
        totalOrders: number;
        pendingOrders: number;
    };
}

export function MerchantHeader({ merchant, stats }: MerchantHeaderProps) {
    const t = useT();
    const router = useRouter();

    const {
        execute: approve,
        isExecuting: isApproving,
    } = useAction(approveMerchant, {
        onSuccess: () => {
            toast({
                title: t("Merchant approved"),
                description: t("The merchant has been successfully verified."),
            });
            router.refresh();
        },
        onError: ({ error }) => {
            if (error.serverError) {
                toast({
                    title: t("Cannot approve merchant"),
                    description: error.serverError,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: t("Error"),
                    description: t("Failed to approve merchant"),
                    variant: "destructive",
                });
            }
        },
    });

    const {
        execute: reject,
        isExecuting: isRejecting,
    } = useAction(rejectMerchant, {
        onSuccess: () => {
            toast({
                title: t("Merchant rejected"),
                description: t("The merchant verification has been removed."),
            });
            router.refresh();
        },
        onError: ({ error }) => {
            if (error.serverError) {
                toast({
                    title: t("Cannot reject merchant"),
                    description: error.serverError,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: t("Error"),
                    description: t("Failed to reject merchant"),
                    variant: "destructive",
                });
            }
        },
    });

    return (
        <>
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-muted">
                                {merchant.logoUrl ? (
                                    <OptimizedImage
                                        src={merchant.logoUrl}
                                        alt={merchant.businessName}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                                        {merchant.businessName[0]}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-4">
                            <div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h2 className="text-2xl font-bold">{merchant.businessName}</h2>
                                    <Badge
                                        variant={merchant.isVerified ? "default" : "secondary"}
                                        className={
                                            merchant.isVerified
                                                ? "bg-green-100 text-green-800"
                                                : "bg-orange-100 text-orange-800"
                                        }
                                    >
                                        {merchant.isVerified ? "Verified" : "Pending Approval"}
                                    </Badge>
                                    <Badge variant="outline">{merchant.merchantType}</Badge>
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Phone className="h-4 w-4" />
                                        {merchant.phone}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        Lat: {merchant.address.latitude.toFixed(4)}, Lng:{" "}
                                        {merchant.address.longitude.toFixed(4)}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="flex gap-6 text-sm">
                                <div>
                                    <span className="text-muted-foreground">{t("Active Products")}</span>
                                    <span className="ml-2 font-semibold">{stats.activeProducts}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">{t("Total Orders")}</span>
                                    <span className="ml-2 font-semibold">{stats.totalOrders}</span>
                                </div>
                                {stats.pendingOrders > 0 && (
                                    <div>
                                        <span className="text-muted-foreground">{t("Pending Orders")}</span>
                                        <span className="ml-2 font-semibold text-orange-600">
                                            {stats.pendingOrders}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                {!merchant.isVerified ? (
                                    <>
                                        <Button onClick={() => approve({ id: merchant.id })} disabled={isApproving}>
                                            <Check className="mr-2 h-4 w-4" />

                                            {isApproving ? t("Approving...") : t("Approve Merchant")}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => reject({ id: merchant.id })}
                                            disabled={isRejecting}
                                        >
                                            <X className="mr-2 h-4 w-4" />
                                            {isRejecting ? t("Rejecting...") : t("Reject")}
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        variant="outline"
                                        onClick={() => reject({ id: merchant.id })}
                                        disabled={isRejecting}
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        {isRejecting ? t("Revoking...") : t("Revoke Verification")}
                                    </Button>
                                )}
                                <MessageDialog merchantId={merchant.id} triggerButton={<Button
                                    variant="secondary"
                                >
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    {t("Send Message")}
                                </Button>} />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}