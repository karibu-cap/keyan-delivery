import { prisma } from "@/lib/prisma";
import { DriverStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./admin-guard";

export async function getDrivers(filters?: {
    search?: string;
    status?: "all" | "pending" | "approved" | "rejected" | "banned";
    page?: number;
    limit?: number;
}) {
    await requireAdmin();

    const { search, status, page = 1, limit = 20 } = filters || {};
    const skip = (page - 1) * limit;

    const where: any = {
        roles: { has: "driver" },
    };

    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search } },
            { cni: { contains: search } },
        ];
    }

    if (status && status !== "all") {
        where.driverStatus = status.toUpperCase();
    }

    const [drivers, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                cni: true,
                driverDocument: true,
                driverStatus: true,
                createdAt: true,
                orders: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
            },
        }),
        prisma.user.count({ where }),
    ]);

    // Calculate stats for each driver
    const driversWithStats = drivers.map((driver) => ({
        ...driver,
        stats: {
            totalDeliveries: driver.orders.filter((o) => o.status === "COMPLETED")
                .length,
            activeDeliveries: driver.orders.filter(
                (o) =>
                    o.status === "ACCEPTED_BY_DRIVER" ||
                    o.status === "ON_THE_WAY" ||
                    o.status === "READY_TO_DELIVER"
            ).length,
        },
    }));

    return {
        drivers: driversWithStats,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getDriverDetails(driverId: string) {
    await requireAdmin();

    const driver = await prisma.user.findUnique({
        where: { id: driverId },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            cni: true,
            driverDocument: true,
            driverStatus: true,
            createdAt: true,
            orders: {
                include: {
                    merchant: {
                        select: {
                            businessName: true,
                        },
                    },
                    user: {
                        select: {
                            name: true,
                            phone: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            },
            wallet: {
                select: {
                    balance: true,
                    currency: true,
                },
            },
        },
    });

    if (!driver) {
        throw new Error("Driver not found");
    }

    // Calculate detailed stats
    const completedOrders = driver.orders.filter(
        (o) => o.status === "COMPLETED"
    );
    const totalEarnings = completedOrders.reduce(
        (sum, order) => sum + (order.orderPrices.deliveryFee || 0),
        0
    );

    const stats = {
        totalDeliveries: completedOrders.length,
        activeDeliveries: driver.orders.filter(
            (o) =>
                o.status === "ACCEPTED_BY_DRIVER" ||
                o.status === "ON_THE_WAY" ||
                o.status === "READY_TO_DELIVER"
        ).length,
        totalEarnings,
        averagePerDelivery:
            completedOrders.length > 0 ? totalEarnings / completedOrders.length : 0,
        walletBalance: driver.wallet?.balance || 0,
    };

    return {
        driver,
        stats,
    };
}

export async function approveDriver(driverId: string) {
    await requireAdmin();

    const driver = await prisma.user.findUnique({
        where: { id: driverId },
        select: {
            cni: true,
            driverDocument: true,
        },
    });

    if (!driver) {
        return {
            success: false,
            error: "Driver not found",
        };
    }

    if (!driver.cni || !driver.driverDocument) {
        return {
            success: false,
            error: "Driver must have both CNI and driver document uploaded",
        };
    }

    await prisma.user.update({
        where: { id: driverId },
        data: { driverStatus: DriverStatus.APPROVED },
    });

    // TODO: Send approval notification to driver

    revalidatePath("/admin/drivers");
    revalidatePath(`/admin/drivers/${driverId}`);

    return { success: true };
}

export async function rejectDriver(driverId: string, reason?: string) {
    await requireAdmin();

    await prisma.user.update({
        where: { id: driverId },
        data: { driverStatus: DriverStatus.REJECTED },
    });

    // TODO: Send rejection notification to driver with reason

    revalidatePath("/admin/drivers");
    revalidatePath(`/admin/drivers/${driverId}`);

    return { success: true };
}

export async function banDriver(driverId: string, reason?: string) {
    await requireAdmin();

    await prisma.user.update({
        where: { id: driverId },
        data: { driverStatus: DriverStatus.BANNED },
    });

    // TODO: Send ban notification to driver with reason

    revalidatePath("/admin/drivers");
    revalidatePath(`/admin/drivers/${driverId}`);

    return { success: true };
}

export async function unbanDriver(driverId: string) {
    await requireAdmin();

    await prisma.user.update({
        where: { id: driverId },
        data: { driverStatus: DriverStatus.APPROVED },
    });

    revalidatePath("/admin/drivers");
    revalidatePath(`/admin/drivers/${driverId}`);

    return { success: true };
}

export async function deleteDriver(driverId: string) {
    await requireAdmin();

    // Check if driver has any active deliveries
    const activeDeliveries = await prisma.order.count({
        where: {
            driverId,
            status: {
                in: ["ACCEPTED_BY_DRIVER", "ON_THE_WAY", "READY_TO_DELIVER"],
            },
        },
    });

    if (activeDeliveries > 0) {
        return {
            success: false,
            error: `Cannot delete driver with ${activeDeliveries} active deliveries`,
        };
    }

    await prisma.user.delete({
        where: { id: driverId },
    });

    revalidatePath("/admin/drivers");

    return { success: true };
}

export async function getDriverStats(driverId: string) {
    await requireAdmin();

    const [driver, orderStats] = await Promise.all([
        prisma.user.findUnique({
            where: { id: driverId },
            select: {
                name: true,
                driverStatus: true,
            },
        }),
        prisma.order.groupBy({
            by: ["status"],
            where: { driverId },
            _count: true,
        }),
    ]);

    return {
        driver,
        orderStats,
    };
}