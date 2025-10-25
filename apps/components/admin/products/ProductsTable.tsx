"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Eye, MoreVertical, Check, X, Trash2, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    bulkProducts,
    deleteProduct,
} from "@/lib/actions/server/admin/products";
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
import { OptimizedImage } from "@/components/ClsOptimization";
import { useT } from "@/hooks/use-inline-translation";
import { updateProduct } from "@/lib/actions/server/admin/products";
import { useAction } from "next-safe-action/hooks";
import { ProductStatus } from "@prisma/client";

interface Product {
    id: string;
    title: string;
    price: number;
    status: string;
    visibility: boolean;
    createdAt: Date;
    images: Array<{ url: string }>;
    merchant: {
        id: string;
        businessName: string;
        isVerified: boolean;
    };
}

interface ProductsTableProps {
    products: Product[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export function ProductsTable({ products, pagination }: ProductsTableProps) {
    const router = useRouter();
    const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const t = useT();


    const {
        execute: approve,
        isExecuting: isApproving,
    } = useAction(updateProduct, {
        onSuccess: () => {
            toast({
                title: t("Product approved"),
                description: t("The product has been verified and is now visible."),
            });
            router.refresh();
        },
        onError: ({ error }) => {
            if (error.serverError) {
                toast({
                    title: t("Cannot approve product"),
                    description: error.serverError,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: t("Error"),
                    description: t("Failed to approve product"),
                    variant: "destructive",
                });
            }
        },
    })

    const {
        execute: reject,
        isExecuting: isRejecting,
    } = useAction(updateProduct, {
        onSuccess: () => {
            toast({
                title: t("Product rejected"),
                description: t("The product has been rejected and hidden."),
                variant: "destructive",
            });
            router.refresh();
        },
        onError: ({ error }) => {
            if (error.serverError) {
                toast({
                    title: t("Cannot reject product"),
                    description: error.serverError,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: t("Error"),
                    description: t("Failed to reject product"),
                    variant: "destructive",
                });
            }
        },
    })

    const { execute: deleteProductExecute,
    } = useAction(deleteProduct, {
        onSuccess: () => {
            toast({
                title: t("Product deleted"),
                description: t("The product has been permanently deleted."),
            });
            router.refresh();
        },
        onError: ({ error }) => {
            if (error.serverError) {
                toast({
                    title: t("Cannot delete product"),
                    description: error.serverError,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: t("Error"),
                    description: t("Failed to delete product"),
                    variant: "destructive",
                });
            }
        },
    })



    const {
        execute: toggleVisibility,
        isExecuting: isTogglingVisibility,
    } = useAction(updateProduct, {
        onSuccess: () => {
            toast({
                title: t("Visibility updated"),
                description: t("Product visibility has been toggled."),
            });
            router.refresh();
        },
        onError: ({ error }) => {
            if (error.serverError) {
                toast({
                    title: t("Cannot update visibility"),
                    description: error.serverError,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: t("Error"),
                    description: t("Failed to update visibility"),
                    variant: "destructive",
                });
            }
        },
    })

    const { execute: bulkApprove, isExecuting: isBulkApproving } = useAction(bulkProducts, {
        onSuccess: () => {
            toast({
                title: t("Bulk approval complete"),
                description: t("All selected products have been approved."),
            });
            router.refresh();
        },
        onError: ({ error }) => {
            if (error.serverError) {
                toast({
                    title: t("Cannot approve products"),
                    description: error.serverError,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: t("Error"),
                    description: t("Failed to approve products"),
                    variant: "destructive",
                });
            }
        },
    })

    const { execute: bulkReject, isExecuting: isBulkRejecting } = useAction(bulkProducts, {
        onSuccess: () => {
            toast({
                title: t("Bulk rejection complete"),
                description: t(`${selectedProducts.length} products rejected.`),
                variant: "destructive",
            });
            setSelectedProducts([]);
            router.refresh();
        },
        onError: ({ error }) => {
            if (error.serverError) {
                toast({
                    title: t("Cannot reject products"),
                    description: error.serverError,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: t("Error"),
                    description: t("Failed to reject products"),
                    variant: "destructive",
                });
            }
        },
    })



    const handleSelectAll = () => {
        if (selectedProducts.length === products.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(products.map((p) => p.id));
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "VERIFIED":
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        {t("Verified")}
                    </Badge>
                );
            case "WAITING_FOR_REVIEW":
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
            case "DRAFT":
                return <Badge variant="secondary">{t("Draft")}</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <>
            {/* Bulk Actions */}
            {selectedProducts.length > 0 && (
                <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                    <span className="text-sm font-medium">
                        {selectedProducts.length} {t("selected")}
                    </span>
                    <Button
                        size="sm"
                        onClick={() => bulkApprove({ productIds: selectedProducts, action: "approve" })}
                        disabled={isBulkApproving}
                    >
                        <Check className="mr-2 h-4 w-4" />
                        {t("Approve All")}
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => bulkReject({ productIds: selectedProducts, action: "reject" })}
                        disabled={isBulkRejecting}
                    >
                        <X className="mr-2 h-4 w-4" />
                        {t("Reject All")}
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedProducts([])}
                    >
                        {t("Clear")}
                    </Button>
                </div>
            )}

            <div className="rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={selectedProducts.length === products.length}
                                    onCheckedChange={handleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="w-[80px]">{t("Image")}</TableHead>
                            <TableHead>{t("Product")}</TableHead>
                            <TableHead>{t("Merchant")}</TableHead>
                            <TableHead>{t("Price")}</TableHead>
                            <TableHead>{t("Status")}</TableHead>
                            <TableHead>{t("Visibility")}</TableHead>
                            <TableHead>{t("Created")}</TableHead>
                            <TableHead className="w-[70px]">{t("Actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center text-muted-foreground">
                                    {t("No products found")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedProducts.includes(product.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedProducts([...selectedProducts, product.id]);
                                                } else {
                                                    setSelectedProducts(
                                                        selectedProducts.filter((id) => id !== product.id)
                                                    );
                                                }
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="relative h-12 w-12 rounded overflow-hidden bg-muted">
                                            {product.images[0]?.url ? (
                                                <OptimizedImage
                                                    src={product.images[0].url}
                                                    alt={product.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                                                    {t("No img")}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-[200px]">
                                            <p className="font-medium line-clamp-1">{product.title}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            href={`/admin/merchants/${product.merchant.id}`}
                                            className="hover:underline"
                                        >
                                            {product.merchant.businessName}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {t.formatAmount(product.price)}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.visibility ? "default" : "secondary"}>
                                            {product.visibility ? "Visible" : "Hidden"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {t.formatDateTime(product.createdAt)}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={isApproving || isRejecting || isTogglingVisibility}
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>{t("Actions")}</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/products/${product.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        {t("View Details")}
                                                    </Link>
                                                </DropdownMenuItem>
                                                {product.status === "WAITING_FOR_REVIEW" && (
                                                    <>
                                                        <DropdownMenuItem
                                                            onClick={() => approve({ productId: product.id, action: "approve" })}
                                                            disabled={isApproving}
                                                        >
                                                            <Check className="mr-2 h-4 w-4" />
                                                            {t("Approve")}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => reject({ productId: product.id, action: "reject" })}
                                                            disabled={isRejecting}
                                                        >
                                                            <X className="mr-2 h-4 w-4" />
                                                            {t("Reject")}
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                {product.status === ProductStatus.VERIFIED && (
                                                    <DropdownMenuItem
                                                        onClick={() => toggleVisibility({ productId: product.id, action: "toggleVisibility" })}
                                                        disabled={isTogglingVisibility}
                                                    >
                                                        {product.visibility ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                                                        {product.visibility ? t("Hide") : t("Show")}
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => setDeleteDialog(product.id)}
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
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href={`?page=${pagination.page - 1}`}
                                aria-disabled={pagination.page === 1}
                                className={
                                    pagination.page === 1 ? "pointer-events-none opacity-50" : ""
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
                            {t("This action cannot be undone. This will permanently delete the product. Products in active orders cannot be deleted.")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteDialog && deleteProductExecute({ productId: deleteDialog })}
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