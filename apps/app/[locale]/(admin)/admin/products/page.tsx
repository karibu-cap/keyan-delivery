import { getProducts } from "@/lib/actions/server/admin/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerT } from "@/i18n/server-translations";
import { ProductsTable } from "@/components/admin/products/ProductsTable";
import { ProductsFilters } from "@/components/admin/products/ProductsFilters";

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
    const params = await searchParams;
    const t = await getServerT();
    const page = parseInt(params.page || "1");
    const search = params.search;
    const status = (params.status || "all") as
        | "all"
        | "verified"
        | "waiting_for_review"
        | "rejected"
        | "draft";

    const data = await getProducts({ search, status, page, limit: 20 });

    const statusCounts = {
        total: data.pagination.total,
        verified: data.products.filter((p) => p.status === "VERIFIED").length,
        pending: data.products.filter((p) => p.status === "WAITING_FOR_REVIEW")
            .length,
        rejected: data.products.filter((p) => p.status === "REJECTED").length,
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{t("Products Management")}</h1>
                    <p className="text-muted-foreground">
                        {t("Review and approve products submitted by merchants")}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t("Total Products")}
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
                            {t("Verified")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {statusCounts.verified}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t("Rejected")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            {statusCounts.rejected}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <ProductsFilters defaultValues={{ search, status }} />

            <ProductsTable products={data.products} pagination={data.pagination} />
        </div>
    );
}