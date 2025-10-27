import { Metadata } from "next";
import { getServerT } from "@/i18n/server-translations";
import { getAllUsers, getUserStats } from "@/lib/actions/server/admin/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserCog, Shield } from "lucide-react";
import UsersList from "@/components/admin/users/UsersList";

export const metadata: Metadata = {
    title: "Users Management | Admin Dashboard",
    description: "Manage users, roles, and permissions",
};

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; role?: string; driverStatus?: string }>;
}) {
    const { search, role, driverStatus } = await searchParams
    const t = await getServerT();
    const users = await getAllUsers({
        search: search,
        role: role as any,
        driverStatus: driverStatus,
    });
    const stats = await getUserStats();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t("Users Management")}</h1>
                <p className="text-muted-foreground">
                    {t("Manage users, roles, and permissions across the platform")}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {t("Total Users")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.verifiedCount} {t("verified")}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            {t("Customers")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.customerCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {((stats.customerCount / stats.totalUsers) * 100).toFixed(0)}% {t("of total")}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <UserCog className="h-4 w-4" />
                            {t("Drivers")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.driverCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.approvedDrivers} {t("approved")}, {stats.pendingDrivers} {t("pending")}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            {t("Admins")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.adminCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t("Platform administrators")}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Users List */}
            <UsersList users={users} />
        </div>
    );
}