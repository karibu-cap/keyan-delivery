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
import { Eye, MoreVertical, Check, X, Trash2, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
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
import { toast } from "@/hooks/use-toast";
import { approveMerchant, deleteMerchant, rejectMerchant } from "@/lib/actions/server/admin/merchants";
import { MessageDialog } from "./MessageDialogue";

interface Merchant {
    id: string;
    businessName: string;
    phone: string;
    isVerified: boolean;
    merchantType: string;
    createdAt: Date;
    _count: {
        products: number;
        order: number;
    };
}

interface MerchantsTableProps {
    merchants: Merchant[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export function MerchantsTable({ merchants, pagination }: MerchantsTableProps) {
    const router = useRouter();
    const t = useT()
    const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

    const {
        execute: approve,
        isExecuting: isApproving,
    } = useAction(approveMerchant, {
        onSuccess: () => {
            toast({
                title: t("Merchant approved"),
                description: t("The merchant has been successfully verified."),
            });
            router.refresh();
        },
        onError: ({ error }) => {
            if (error.serverError) {
                toast({
                    title: t("Cannot approve merchant"),
                    description: error.serverError,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: t("Error"),
                    description: t("Failed to approve merchant"),
                    variant: "destructive",
                });
            }
        },
    });


    const {
        execute: reject,
        isExecuting: isRejecting,
    } = useAction(rejectMerchant, {
        onSuccess: () => {
            toast({
                title: t("Merchant rejected"),
                description: t("The merchant verification has been removed."),
            });
            router.refresh();
        },
        onError: ({ error }) => {
            if (error.serverError) {
                toast({
                    title: t("Cannot reject merchant"),
                    description: error.serverError,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: t("Error"),
                    description: t("Failed to reject merchant"),
                    variant: "destructive",
                });
            }
        },
    });

    const {
        execute: deleteMerchantExec,
        isExecuting: isDeleting,
    } = useAction(deleteMerchant, {
        onSuccess: () => {
            toast({
                title: t("Merchant deleted"),
                description: t("The merchant has been permanently deleted."),
            });
            router.refresh();
        },
        onError: ({ error }) => {
            if (error.serverError) {
                toast({
                    title: t("Cannot delete merchant"),
                    description: error.serverError,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: t("Error"),
                    description: t("Failed to delete merchant"),
                    variant: "destructive",
                });
            }
        },
    });

    return (
        <>
            <div className="rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("Business Name")}</TableHead>
                            <TableHead>{t("Phone")}</TableHead>
                            <TableHead>{t("Type")}</TableHead>
                            <TableHead>{t("Products")}</TableHead>
                            <TableHead>{t("Orders")}</TableHead>
                            <TableHead>{t("Status")}</TableHead>
                            <TableHead>{t("Joined")}</TableHead>
                            <TableHead className="w-[70px]">{t("Actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {merchants.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-muted-foreground">
                                    {t("No merchants found")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            merchants.map((merchant) => (
                                <TableRow key={merchant.id}>
                                    <TableCell className="font-medium">
                                        {merchant.businessName}
                                    </TableCell>
                                    <TableCell>{merchant.phone}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{merchant.merchantType}</Badge>
                                    </TableCell>
                                    <TableCell>{merchant._count.products}</TableCell>
                                    <TableCell>
                                        <span
                                            className={
                                                merchant._count.order > 0
                                                    ? "font-medium text-primary"
                                                    : "text-muted-foreground"
                                            }
                                        >
                                            {merchant._count.order}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={merchant.isVerified ? "default" : "secondary"}
                                            className={
                                                merchant.isVerified
                                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                    : "bg-orange-100 text-orange-800 hover:bg-orange-100"
                                            }
                                        >
                                            {merchant.isVerified ? "Verified" : "Pending"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(merchant.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={isApproving || isRejecting || isDeleting}
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>{t("Actions")}</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/merchants/${merchant.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        {t("View Details")}
                                                    </Link>
                                                </DropdownMenuItem>
                                                {!merchant.isVerified ? (
                                                    <DropdownMenuItem
                                                        onClick={() => approve({ id: merchant.id })}
                                                        disabled={isApproving}
                                                    >
                                                        <Check className="mr-2 h-4 w-4" />
                                                        {isApproving ? t("Approving...") : t("Approve")}
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem
                                                        onClick={() => reject({ id: merchant.id })}
                                                        disabled={isRejecting}
                                                    >
                                                        <X className="mr-2 h-4 w-4" />
                                                        {isRejecting ? t("Rejecting...") : t("Revoke Verification")}
                                                    </DropdownMenuItem>
                                                )}
                                                <MessageDialog merchantId={merchant.id} triggerButton={<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                    <MessageSquare className="mr-2 h-4 w-4" />
                                                    {t("Send Message")}
                                                </DropdownMenuItem>}
                                                />
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => setDeleteDialog(merchant.id)}
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

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <Pagination className="justify-end">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href={`?page=${pagination.page - 1}`}
                                aria-disabled={pagination.page === 1}
                                className={
                                    pagination.page === 1
                                        ? "pointer-events-none opacity-50"
                                        : ""
                                }
                            />
                        </PaginationItem>
                        {[...Array(pagination.totalPages)].map((_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink
                                    href={`?page=${i + 1}`}
                                    isActive={pagination.page === i + 1}
                                >
                                    {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                href={`?page=${pagination.page + 1}`}
                                aria-disabled={pagination.page === pagination.totalPages}
                                className={
                                    pagination.page === pagination.totalPages
                                        ? "pointer-events-none opacity-50"
                                        : ""
                                }
                            />
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
                            {t("This action cannot be undone. This will permanently delete the merchant and all associated data.")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteDialog && deleteMerchantExec({ id: deleteDialog })}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting ? t("Deleting...") : t("Delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}