import { Metadata } from "next";
import { getServerT } from "@/i18n/server-translations";
import { getAllZones } from "@/lib/actions/server/admin/zones";
import ZonesList from "@/components/admin/zones/ZonesList";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
    title: "Delivery Zones | Admin Dashboard",
    description: "Manage delivery zones, landmarks, and coverage areas",
};

async function getZoneStats() {
    const [totalZones, activeZones, totalOrders, totalLandmarks] = await Promise.all([
        prisma.deliveryZone.count(),
        prisma.deliveryZone.count({ where: { status: "ACTIVE" } }),
        prisma.order.count({ where: { deliveryZoneId: { not: null } } }),
        prisma.deliveryZone.findMany({ select: { landmarks: true } }),
    ]);

    const landmarkCount = totalLandmarks.reduce((acc, zone) => acc + (zone.landmarks?.length || 0), 0);

    return {
        totalZones,
        activeZones,
        totalOrders,
        totalLandmarks: landmarkCount,
    };
}

export default async function ZonesPage() {
    const t = await getServerT();
    const zones = await getAllZones();
    const stats = await getZoneStats();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("Delivery Zones")}</h1>
                    <p className="text-muted-foreground">{t("Manage delivery zones, landmarks, and coverage areas")}</p>
                </div>
                <Link href="/admin/zones/new">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        {t("Create Zone")}
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t("Total Zones")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalZones}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t("{count} active", { count: stats.activeZones })}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t("Total Landmarks")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalLandmarks}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t("Across all zones")}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t("Total Orders")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrders}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t("In delivery zones")}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t("Coverage")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {((stats.activeZones / Math.max(stats.totalZones, 1)) * 100).toFixed(0)}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t("Active coverage")}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Zones List */}
            <ZonesList zones={zones} />
        </div>
    );
}