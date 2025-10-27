import { MerchantsFilters, MerchantsTable } from "@/components/admin/merchants";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getServerT } from "@/i18n/server-translations";
import { getMerchants } from "@/lib/actions/server/admin/merchants";

export default async function MerchantsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
    const t = await getServerT();
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const search = params.search;
    const status = (params.status || "all") as "all" | "verified" | "pending";

    const data = await getMerchants({ search, status, page, limit: 5 });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{t("Merchants Management")}</h1>
                    <p className="text-muted-foreground">
                        {t("Approve, manage, and monitor all merchants on the platform")}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t("Total Merchants")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.pagination.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t("Verified")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {data.merchants.filter((m) => m.isVerified).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t("Pending Approval")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {data.merchants.filter((m) => !m.isVerified).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <MerchantsFilters defaultValues={{ search, status }} />

            {/* Table */}
            <MerchantsTable merchants={data.merchants} pagination={data.pagination} />
        </div>
    );
}