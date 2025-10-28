import { getDrivers } from "@/lib/actions/server/admin/drivers";
import { DriversTable } from "@/components/admin/drivers/DriversTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerT } from "@/i18n/server-translations";
import { DriversFilters } from "@/components/admin/drivers/DriversFilters";

export default async function DriversPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
    const params = await searchParams;
    const t = await getServerT()
    const page = parseInt(params.page || "1");
    const search = params.search;
    const status = (params.status || "all") as
        | "all"
        | "pending"
        | "approved"
        | "rejected"
        | "banned";

    const data = await getDrivers({ search, status, page, limit: 20 });

    const statusCounts = {
        total: data.pagination.total,
        pending: data.drivers.filter((d) => d.driverStatus === "PENDING").length,
        approved: data.drivers.filter((d) => d.driverStatus === "APPROVED").length,
        rejected: data.drivers.filter((d) => d.driverStatus === "REJECTED").length,
        banned: data.drivers.filter((d) => d.driverStatus === "BANNED").length,
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{t("Drivers Management")}</h1>
                    <p className="text-muted-foreground">
                        {t("Review driver applications and manage driver accounts")}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t("Total Drivers")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statusCounts.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t("Pending Review")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {statusCounts.pending}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t("Approved")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {statusCounts.approved}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t("Rejected/Banned")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            {statusCounts.rejected + statusCounts.banned}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <DriversFilters defaultValues={{ search, status }} />

            <DriversTable drivers={data.drivers} pagination={data.pagination} />
        </div>
    );
}