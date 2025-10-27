'use server'
import { prisma } from "@/lib/prisma";
import { DriverStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import z from "zod";
import { actionAdminClient, ActionError, requireAdmin } from "./admin-guard";

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

export const updateDriver = actionAdminClient
    .inputSchema(z.object({ id: z.string().min(1), action: z.enum(['approve', 'reject', 'delete', 'ban', 'unban']) }))
    .action(async ({ parsedInput: { id, action } }) => {
        const driver = await prisma.user.findUnique({
            where: { id: id },
            select: {
                cni: true,
                driverDocument: true,
            },
        });

        if (!driver) {
            throw new ActionError("Driver not found");
        }

        switch (action) {
            case 'approve':
                if (!driver.cni || !driver.driverDocument) {
                    throw new ActionError("Driver must have both CNI and driver document uploaded");
                }
                await prisma.user.update({
                    where: { id },
                    data: { driverStatus: DriverStatus.APPROVED },
                });
                break;
            case 'reject':
                await prisma.user.update({
                    where: { id },
                    data: { driverStatus: DriverStatus.REJECTED },
                });
                break;
            case 'delete':
                const activeDeliveries = await prisma.order.count({
                    where: {
                        driverId: id,
                        status: {
                            in: ["ACCEPTED_BY_DRIVER", "ON_THE_WAY", "READY_TO_DELIVER"],
                        },
                    },
                });
                if (activeDeliveries > 0) {
                    throw new ActionError("Cannot delete driver with active deliveries");
                }
                await prisma.user.delete({ where: { id } });
                break;
            case 'ban':
                await prisma.user.update({
                    where: { id },
                    data: { driverStatus: DriverStatus.BANNED },
                });
                break;
            case 'unban':
                await prisma.user.update({
                    where: { id },
                    data: { driverStatus: DriverStatus.APPROVED },
                });
                break;
        }

        revalidatePath("/admin/drivers");
        revalidatePath(`/admin/drivers/${id}`);
        return { success: true };
    });

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