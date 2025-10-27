"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Ban, Unlock, Mail, Phone, Calendar } from "lucide-react";
import { updateDriver } from "@/lib/actions/server/admin/drivers";

import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useT } from "@/hooks/use-inline-translation";
import { useAction } from "next-safe-action/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DriverStatus } from "@prisma/client";

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
    const t = useT();

    const {
        execute: updateDriverExec,
        isExecuting: isUpdating,
        input,
    } = useAction(updateDriver, {
        onSuccess: () => {
            toast({
                title: t('Driver {action}', { action: input.action }),
                description: t('The driver has been {action} successfully.', { action: input.action }),
            });
            router.refresh();
        },
        onError: ({ error }) => {
            if (error.serverError) {
                toast({
                    title: t('Cannot {action} the driver', { action: input.action }),
                    description: error.serverError,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: t('Error'),
                    description: t('Failed to {action} the driver', { action: input.action }),
                    variant: "destructive",
                });
            }
        },
    })


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
                        <Avatar className="flex h-24 w-24 flex-shrink-0">
                            <AvatarImage src={driver?.image || undefined} alt="@manager" />
                            <AvatarFallback className="flex items-center justify-center bg-primary text-primary-foreground text-3xl font-bold"> {driver?.name?.[0]?.toUpperCase() || driver?.email[0].toUpperCase() || "A"} </AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h2 className="text-2xl font-bold">
                                    {driver.name || t("Unnamed Driver")}
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
                                <span className="text-muted-foreground">{t("Total Deliveries")}:</span>
                                <span className="ml-2 font-semibold">{stats.totalDeliveries}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">{t("Active")}:</span>
                                <span className="ml-2 font-semibold text-orange-600">
                                    {stats.activeDeliveries}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">{t("Total Earnings")}:</span>
                                <span className="ml-2 font-semibold text-green-600">
                                    {t.formatAmount(stats.totalEarnings)}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 flex-wrap">
                            {(driver.driverStatus === DriverStatus.PENDING || driver.driverStatus === DriverStatus.REJECTED) && (
                                <>
                                    <Button onClick={() => updateDriverExec({ id: driver.id, action: "approve" })} disabled={isUpdating}>
                                        <Check className="mr-2 h-4 w-4" />
                                        {t("Approve Driver")}
                                    </Button>
                                    {driver.driverStatus === DriverStatus.PENDING && (<Button
                                        variant="outline"
                                        onClick={() => updateDriverExec({ id: driver.id, action: "reject" })}
                                        disabled={isUpdating}
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        {t("Reject")}
                                    </Button>)}
                                </>
                            )}
                            {driver.driverStatus === "APPROVED" && (
                                <Button
                                    variant="destructive"
                                    onClick={() => updateDriverExec({ id: driver.id, action: "ban" })}
                                    disabled={isUpdating}
                                >
                                    <Ban className="mr-2 h-4 w-4" />
                                    {t("Ban Driver")}
                                </Button>
                            )}
                            {driver.driverStatus === "BANNED" && (
                                <Button onClick={() => updateDriverExec({ id: driver.id, action: "unban" })} disabled={isUpdating}>
                                    <Unlock className="mr-2 h-4 w-4" />
                                    {t("Unban Driver")}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}