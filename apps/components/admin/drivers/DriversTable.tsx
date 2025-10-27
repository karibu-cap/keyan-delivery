"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, MoreVertical, Check, X, Ban, Unlock, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateDriver } from "@/lib/actions/server/admin/drivers";
import { toast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { useT } from "@/hooks/use-inline-translation";
import { useAction } from "next-safe-action/hooks";

interface Driver {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    cni: string | null;
    driverDocument: string | null;
    driverStatus: string | null;
    createdAt: Date | null;
    stats: {
        totalDeliveries: number;
        activeDeliveries: number;
    };
}

interface DriversTableProps {
    drivers: Driver[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}



export function DriversTable({ drivers, pagination }: DriversTableProps) {
    const router = useRouter();
    const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
    const t = useT()

    const {
        execute: updateDriverExec,
        isExecuting: isUpdating,
        input,
    } = useAction(updateDriver, {
        onSuccess: () => {
            toast({
                title: t('Driver {action}', { action: input.action }),
                description: t('The driver has been {action} successfully.', { action: input.action }),
            });
            router.refresh();
        },
        onError: ({ error }) => {
            if (error.serverError) {
                toast({
                    title: t('Cannot {action} the driver', { action: input.action }),
                    description: error.serverError,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: t('Error'),
                    description: t('Failed to {action} the driver', { action: input.action }),
                    variant: "destructive",
                });
            }
        },
    })


    const getStatusBadge = (status: string | null) => {
        switch (status) {
            case "APPROVED":
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        {t("Approved")}
                    </Badge>
                );
            case "PENDING":
                return (
                    <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                        {t("Pending")}
                    </Badge>
                );
            case "REJECTED":
                return (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        {t("Rejected")}
                    </Badge>
                );
            case "BANNED":
                return (
                    <Badge className="bg-gray-900 text-white hover:bg-gray-900">
                        {t("Banned")}
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{t("Unknown")}</Badge>;
        }
    };

    return (
        <>
            <div className="rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("Name")}</TableHead>
                            <TableHead>{t("Email")}</TableHead>
                            <TableHead>{t("Phone")}</TableHead>
                            <TableHead>{t("Documents")}</TableHead>
                            <TableHead>{t("Deliveries")}</TableHead>
                            <TableHead>{t("Active")}</TableHead>
                            <TableHead>{t("Status")}</TableHead>
                            <TableHead>{t("Joined")}</TableHead>
                            <TableHead className="w-[70px]">{t("Actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {drivers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center text-muted-foreground">
                                    {t("No drivers found")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            drivers.map((driver) => (
                                <TableRow key={driver.id}>
                                    <TableCell className="font-medium">
                                        {driver.name || t("N/A")}
                                    </TableCell>
                                    <TableCell>{driver.email}</TableCell>
                                    <TableCell>{driver.phone || t("N/A")}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Badge
                                                variant={driver.cni ? "default" : "secondary"}
                                                className="text-xs"
                                            >
                                                {t("CNI")} {driver.cni ? t("✓") : t("✗")}
                                            </Badge>
                                            <Badge
                                                variant={driver.driverDocument ? "default" : "secondary"}
                                                className="text-xs"
                                            >
                                                {t("License")} {driver.driverDocument ? t("✓") : t("✗")}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium text-primary">
                                            {driver.stats.totalDeliveries}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {driver.stats.activeDeliveries > 0 ? (
                                            <span className="font-medium text-orange-600">
                                                {driver.stats.activeDeliveries}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">0</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(driver.driverStatus)}</TableCell>
                                    <TableCell>
                                        {driver.createdAt ? t.formatDateTime(driver.createdAt) : "-"}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={isUpdating}
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>{t("Actions")}</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/drivers/${driver.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        {t("View Details")}
                                                    </Link>
                                                </DropdownMenuItem>
                                                {driver.driverStatus === "PENDING" && (
                                                    <>
                                                        <DropdownMenuItem
                                                            onClick={() => updateDriverExec({ action: "approve", id: driver.id })}
                                                            disabled={isUpdating}
                                                        >
                                                            <Check className="mr-2 h-4 w-4" />
                                                            {t("Approve")}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => updateDriverExec({ action: "reject", id: driver.id })}
                                                            disabled={isUpdating}
                                                        >
                                                            <X className="mr-2 h-4 w-4" />
                                                            {t("Reject")}
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                {driver.driverStatus === "APPROVED" && (
                                                    <DropdownMenuItem
                                                        onClick={() => updateDriverExec({ action: "ban", id: driver.id })}
                                                        disabled={isUpdating}
                                                    >
                                                        <Ban className="mr-2 h-4 w-4" />
                                                        {t("Ban Driver")}
                                                    </DropdownMenuItem>
                                                )}
                                                {driver.driverStatus === "BANNED" && (
                                                    <DropdownMenuItem
                                                        onClick={() => updateDriverExec({ action: "unban", id: driver.id })}
                                                        disabled={isUpdating}
                                                    >
                                                        <Unlock className="mr-2 h-4 w-4" />
                                                        {t("Unban Driver")}
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => setDeleteDialog(driver.id)}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    {t("Delete")}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            {pagination.totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href={`?page=${pagination.page - 1}`}
                                aria-disabled={pagination.page === 1}
                                className={pagination.page === 1 ? "pointer-events-none opacity-50" : ""} size="default" />
                        </PaginationItem>
                        {[...Array(pagination.totalPages)].map((_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink
                                    href={`?page=${i + 1}`}
                                    isActive={pagination.page === i + 1} size="default">
                                    {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                href={`?page=${pagination.page + 1}`}
                                aria-disabled={pagination.page === pagination.totalPages}
                                className={pagination.page === pagination.totalPages
                                    ? "pointer-events-none opacity-50"
                                    : ""} size="default" />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteDialog !== null}
                onOpenChange={() => setDeleteDialog(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("Are you absolutely sure?")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("This action cannot be undone. This will permanently delete the driver account. The driver cannot be deleted if they have active deliveries.")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteDialog && updateDriverExec({ action: "delete", id: deleteDialog })}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {t("Delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}