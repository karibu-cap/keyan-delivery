import { MerchantHeader } from "@/components/admin/merchants/MerchantHeader";
import { MerchantStats } from "@/components/admin/merchants/MerchantStats";
import { MerchantProducts } from "@/components/admin/merchants/MerchantProducts";
import { MerchantOrders } from "@/components/admin/merchants/MerchantOrders";
import { MerchantManagers } from "@/components/admin/merchants/MerchantManagers";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMerchantDetails } from "@/lib/actions/server/admin/merchants";
import { getServerT } from "@/i18n/server-translations";

export default async function MerchantDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    let data;
    try {
        data = await getMerchantDetails((await params).id);
    } catch (error) {
        notFound();
    }

    const { merchant, stats } = data;
    const t = await getServerT()

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Button variant="ghost" asChild>
                <Link href="/admin/merchants">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("Back to Merchants")}
                </Link>
            </Button>

            <MerchantHeader merchant={merchant} stats={stats} />

            <MerchantStats stats={stats} merchant={merchant} />

            <Tabs defaultValue="products" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="products">
                        {t("Products")} ({merchant.products.length})
                    </TabsTrigger>
                    <TabsTrigger value="orders">
                        {t("Orders")} ({merchant.order.length})
                    </TabsTrigger>
                    <TabsTrigger value="managers">
                        {t("Managers")} ({merchant.managers.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="products" className="space-y-4">
                    <MerchantProducts products={merchant.products} />
                </TabsContent>

                <TabsContent value="orders" className="space-y-4">
                    <MerchantOrders orders={merchant.order} merchantId={merchant.id} />
                </TabsContent>

                <TabsContent value="managers" className="space-y-4">
                    <MerchantManagers managers={merchant.managers} />
                </TabsContent>
            </Tabs>
        </div>
    );
}