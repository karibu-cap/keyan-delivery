"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, MessageSquare, MapPin, Phone } from "lucide-react";
import { OptimizedImage } from "@/components/ClsOptimization";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/hooks/use-inline-translation";
import { toast } from "@/hooks/use-toast";
import { approveMerchant, rejectMerchant } from "@/lib/actions/client/admin/merchants";

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
    const [loading, setLoading] = useState(false);
    const [messageDialog, setMessageDialog] = useState(false);
    const [message, setMessage] = useState("");


    const handleApprove = async () => {
        setLoading(true);
        try {
            const result = await approveMerchant(merchant.id);
            if (result.success) {
                toast({
                    title: t("Merchant approved"),
                    description: t("The merchant has been successfully verified."),
                });
                router.refresh();
            } else {
                toast({
                    title: t("Cannot approve merchant"),
                    description: result.error,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: t("Error"),
                description: t("Failed to approve merchant"),
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        setLoading(true);
        try {
            const result = await rejectMerchant(merchant.id);
            if (result.success) {
                toast({
                    title: t("Merchant rejected"),
                    description: t("The merchant verification has been removed."),
                });
                router.refresh();
            } else {
                toast({
                    title: t("Cannot reject merchant"),
                    description: result.error,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: t("Error"),
                description: t("Failed to reject merchant"),
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = () => {
        // TODO: Implement notification sending
        toast({
            title: t("Message sent"),
            description: t("Notification has been sent to the merchant."),
        });
        setMessageDialog(false);
        setMessage("");
    };

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
                                        <Button onClick={handleApprove} disabled={loading}>
                                            <Check className="mr-2 h-4 w-4" />
                                            {t("Approve Merchant")}
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
                                ) : (
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
                                    onClick={() => setMessageDialog(true)}
                                >
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    {t("Send Message")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Send Message Dialog */}
            <Dialog open={messageDialog} onOpenChange={setMessageDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("Send Message to {merchant.businessName}")}</DialogTitle>
                        <DialogDescription>
                            {t("This notification will be sent to the merchant via push notification and email.")}
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Enter your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={5}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setMessageDialog(false)}>
                            {t("Cancel")}
                        </Button>
                        <Button onClick={handleSendMessage} disabled={!message.trim()}>
                            {t("Send Message")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}