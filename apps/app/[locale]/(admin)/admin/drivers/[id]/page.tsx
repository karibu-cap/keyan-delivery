import { DriverHeader } from "@/components/admin/drivers/DriverHeader";
import { DriverStats } from "@/components/admin/drivers/DriverStats";
import { DriverDocuments } from "@/components/admin/drivers/DriverDocuments";
import { DriverOrders } from "@/components/admin/drivers/DriverOrders";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDriverDetails } from "@/lib/actions/server/admin/drivers";
import { getServerT } from "@/i18n/server-translations";

export default async function DriverDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    let data;
    const _params = await params;
    try {
        data = await getDriverDetails(_params.id);
    } catch (error) {
        notFound();
    }

    const t = await getServerT()
    const { driver, stats } = data;

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Button variant="ghost" asChild>
                <Link href="/admin/drivers">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("Back to Drivers")}
                </Link>
            </Button>

            {/* Driver Header */}
            <DriverHeader driver={driver} stats={stats} />

            {/* Stats Cards */}
            <DriverStats stats={stats} driver={driver} />

            {/* Tabs */}
            <Tabs defaultValue="documents" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="documents">{t("Documents")}</TabsTrigger>
                    <TabsTrigger value="orders">
                        {t("Delivery History")} ({driver.orders.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="documents" className="space-y-4">
                    <DriverDocuments driver={driver} />
                </TabsContent>

                <TabsContent value="orders" className="space-y-4">
                    <DriverOrders orders={driver.orders} />
                </TabsContent>
            </Tabs>
        </div>
    );
}