import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import {
    Store,
    Package,
    Users,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getServerT } from "@/i18n/server-translations";

async function getAdminStats() {
    const [
        totalMerchants,
        pendingMerchants,
        activeMerchants,
        totalProducts,
        pendingProducts,
        totalUsers,
        totalDrivers,
        pendingDrivers,
        todayOrders,
        pendingOrders,
    ] = await Promise.all([
        prisma.merchant.count(),
        prisma.merchant.count({ where: { isVerified: false } }),
        prisma.merchant.count({ where: { isVerified: true } }),
        prisma.product.count(),
        prisma.product.count({ where: { status: "WAITING_FOR_REVIEW" } }),
        prisma.user.count(),
        prisma.user.count({
            where: { roles: { has: "driver" } },
        }),
        prisma.user.count({
            where: {
                roles: { has: "driver" },
                driverStatus: "PENDING",
            },
        }),
        prisma.order.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
            },
        }),
        prisma.order.count({
            where: { status: "PENDING" },
        }),
    ]);

    return {
        totalMerchants,
        pendingMerchants,
        activeMerchants,
        totalProducts,
        pendingProducts,
        totalUsers,
        totalDrivers,
        pendingDrivers,
        todayOrders,
        pendingOrders,
    };
}

async function getRecentActivity() {
    const recentMerchants = await prisma.merchant.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            businessName: true,
            isVerified: true,
            createdAt: true,
        },
    });

    const recentProducts = await prisma.product.findMany({
        take: 5,
        where: { status: "WAITING_FOR_REVIEW" },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            merchant: {
                select: {
                    businessName: true,
                },
            },
        },
    });

    return { recentMerchants, recentProducts };
}

export default async function AdminDashboard() {
    const t = await getServerT();
    const stats = await getAdminStats();
    const activity = await getRecentActivity();

    const statCards = [
        {
            title: t("Total Merchants"),
            value: stats.totalMerchants,
            icon: Store,
            description: `${stats.pendingMerchants} ${t("pending approval")}`,
            href: "/admin/merchants",
            trend: "+12% from last month",
        },
        {
            title: t("Total Products"),
            value: stats.totalProducts,
            icon: Package,
            description: `${stats.pendingProducts} ${t("pending review")}`,
            href: "/admin/products",
            trend: "+8% from last month",
        },
        {
            title: t("Total Users"),
            value: stats.totalUsers,
            icon: Users,
            description: t("Active platform users"),
            href: "/admin/users",
            trend: "+23% from last month",
        },
        {
            title: t("Drivers"),
            value: stats.totalDrivers,
            icon: TrendingUp,
            description: `${stats.pendingDrivers} ${t("pending approval")}`,
            href: "/admin/drivers",
            trend: "+5% from last month",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    {t("Welcome back! Here's what's happening with your platform today.")}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Link key={stat.title} href={stat.href}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {stat.description}
                                    </p>
                                    <p className="text-xs text-primary mt-2">{stat.trend}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="flex items-center justify-between p-6">
                        <div>
                            <p className="text-sm font-medium text-orange-900">
                                {t("Pending Orders")}
                            </p>
                            <p className="text-2xl font-bold text-orange-700">
                                {stats.pendingOrders}
                            </p>
                        </div>
                        <Clock className="h-8 w-8 text-orange-500" />
                    </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="flex items-center justify-between p-6">
                        <div>
                            <p className="text-sm font-medium text-blue-900">
                                {t("Today's Orders")}
                            </p>
                            <p className="text-2xl font-bold text-blue-700">
                                {stats.todayOrders}
                            </p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-blue-500" />
                    </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50">
                    <CardContent className="flex items-center justify-between p-6">
                        <div>
                            <p className="text-sm font-medium text-red-900">
                                {t("Pending Reviews")}
                            </p>
                            <p className="text-2xl font-bold text-red-700">
                                {stats.pendingMerchants + stats.pendingProducts + stats.pendingDrivers}
                            </p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-red-500" />
                    </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                    <CardContent className="flex items-center justify-between p-6">
                        <div>
                            <p className="text-sm font-medium text-green-900">
                                {t("Active Merchants")}
                            </p>
                            <p className="text-2xl font-bold text-green-700">
                                {stats.activeMerchants}
                            </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-500" />
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Recent Merchants */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{t("Recent Merchants")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {activity.recentMerchants.map((merchant) => (
                                <div
                                    key={merchant.id}
                                    className="flex items-center justify-between border-b pb-3 last:border-0"
                                >
                                    <div>
                                        <p className="font-medium">{merchant.businessName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(merchant.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={merchant.isVerified ? "default" : "secondary"}
                                    >
                                        {merchant.isVerified ? "Verified" : "Pending"}
                                    </Badge>
                                </div>
                            ))}
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/admin/merchants">{t("View All Merchants")}</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Pending Products */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{t("Pending Products")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {activity.recentProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between border-b pb-3 last:border-0"
                                >
                                    <div>
                                        <p className="font-medium">{product.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {product.merchant.businessName}
                                        </p>
                                    </div>
                                    <Badge variant="secondary">{t("Review")}</Badge>
                                </div>
                            ))}
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/admin/products">{t("Review Products")}</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}