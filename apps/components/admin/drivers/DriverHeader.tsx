"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Ban, Unlock, Mail, Phone, Calendar } from "lucide-react";
import { useState } from "react";
import {
    approveDriver,
    rejectDriver,
    banDriver,
    unbanDriver,
} from "@/lib/actions/client/admin/drivers";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useT } from "@/hooks/use-inline-translation";

interface DriverHeaderProps {
    driver: any;
    stats: {
        totalDeliveries: number;
        activeDeliveries: number;
        totalEarnings: number;
        averagePerDelivery: number;
        walletBalance: number;
    };
}

export function DriverHeader({ driver, stats }: DriverHeaderProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const t = useT();

    const handleApprove = async () => {
        setLoading(true);
        try {
            const result = await approveDriver(driver.id);
            if (result.success) {
                toast({
                    title: t("Driver approved"),
                    description: t("The driver has been successfully verified."),
                });
                router.refresh();
            } else {
                toast({
                    title: t("Cannot approve driver"),
                    description: result.error,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: t("Error"),
                description: t("Failed to approve driver"),
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        setLoading(true);
        try {
            await rejectDriver(driver.id);
            toast({
                title: t("Driver rejected"),
                description: t("The driver application has been rejected."),
            });
            router.refresh();
        } catch (error) {
            toast({
                title: t("Error"),
                description: t("Failed to reject driver"),
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBan = async () => {
        setLoading(true);
        try {
            await banDriver(driver.id);
            toast({
                title: t("Driver banned"),
                description: t("The driver has been banned from the platform."),
                variant: "destructive",
            });
            router.refresh();
        } catch (error) {
            toast({
                title: t("Error"),
                description: t("Failed to ban driver"),
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUnban = async () => {
        setLoading(true);
        try {
            await unbanDriver(driver.id);
            toast({
                title: t("Driver unbanned"),
                description: t("The driver has been unbanned and approved."),
            });
            router.refresh();
        } catch (error) {
            toast({
                title: t("Error"),
                description: t("Failed to unban driver"),
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string | null) => {
        switch (status) {
            case "APPROVED":
                return (
                    <Badge className="bg-green-100 text-green-800">{t("Approved")}</Badge>
                );
            case "PENDING":
                return (
                    <Badge className="bg-orange-100 text-orange-800">
                        {t("PendingReview")}
                    </Badge>
                );
            case "REJECTED":
                return (
                    <Badge className="bg-red-100 text-red-800">{t("Rejected")}</Badge>
                );
            case "BANNED":
                return (
                    <Badge className="bg-gray-900 text-white">{t("Banned")}</Badge>
                );
            default:
                return <Badge variant="secondary">{t("Unknown")}</Badge>;
        }
    };

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="h-24 w-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold">
                            {driver.name?.[0]?.toUpperCase() || driver.email[0].toUpperCase()}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h2 className="text-2xl font-bold">
                                    {driver.name || t("UnnamedDriver")}
                                </h2>
                                {getStatusBadge(driver.driverStatus)}
                            </div>
                            <div className="flex flex-col gap-2 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Mail className="h-4 w-4" />
                                    {driver.email}
                                </div>
                                {driver.phone && (
                                    <div className="flex items-center gap-1">
                                        <Phone className="h-4 w-4" />
                                        {driver.phone}
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {t("Joined")} {new Date(driver.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-6 text-sm flex-wrap">
                            <div>
                                <span className="text-muted-foreground">{t("TotalDeliveries")}:</span>
                                <span className="ml-2 font-semibold">{stats.totalDeliveries}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">{t("Active")}:</span>
                                <span className="ml-2 font-semibold text-orange-600">
                                    {stats.activeDeliveries}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">{t("TotalEarnings")}:</span>
                                <span className="ml-2 font-semibold text-green-600">
                                    {t.formatAmount(stats.totalEarnings)}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 flex-wrap">
                            {driver.driverStatus === "PENDING" && (
                                <>
                                    <Button onClick={handleApprove} disabled={loading}>
                                        <Check className="mr-2 h-4 w-4" />
                                        {t("ApproveDriver")}
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
                            {driver.driverStatus === "APPROVED" && (
                                <Button
                                    variant="destructive"
                                    onClick={handleBan}
                                    disabled={loading}
                                >
                                    <Ban className="mr-2 h-4 w-4" />
                                    {t("BanDriver")}
                                </Button>
                            )}
                            {driver.driverStatus === "BANNED" && (
                                <Button onClick={handleUnban} disabled={loading}>
                                    <Unlock className="mr-2 h-4 w-4" />
                                    {t("UnbanDriver")}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}