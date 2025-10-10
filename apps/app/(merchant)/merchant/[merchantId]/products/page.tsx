"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Plus,
    Edit,
    Eye,
    Trash2,
    Search,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
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
import { deleteProduct, getMerchantProducts } from "@/lib/actions/merchants";
import Image from "next/image";
import { IProduct } from "@/lib/actions/stores";

interface Product {
    id: string;
    title: string;
    price: number;
    stock: number;
    status: string;
    visibility: boolean;
    media: {
        url: string;
    };
    categories: Array<{
        category: {
            name: string;
        };
    }>;
    _count: {
        OrderItem: number;
        cartItems: number;
    };
}

export default function MerchantProductsPage() {
    const params = useParams<{ merchantId: string }>();
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<IProduct[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [products, searchQuery, statusFilter]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await getMerchantProducts(params.merchantId, { limit: 100 });

            if (res.success) {
                setProducts(res.products);
            } else {
                toast({
                    title: 'Error',
                    description: res.error,
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast({
                title: 'Error',
                description: 'Failed to load products',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = products;

        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (statusFilter !== "ALL") {
            filtered = filtered.filter(p => p.status === statusFilter);
        }

        setFilteredProducts(filtered);
    };

    const handleDelete = async () => {
        if (!productToDelete) return;

        try {
            const res = await deleteProduct(productToDelete, params.merchantId);

            if (res.success) {
                toast({
                    title: 'Success',
                    description: 'Product deleted successfully',
                    variant: 'default'
                });
                fetchProducts();
            } else {
                toast({
                    title: 'Error',
                    description: res.error,
                    variant: 'destructive'
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete product',
                variant: 'destructive'
            });
        } finally {
            setDeleteDialogOpen(false);
            setProductToDelete(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'VERIFIED':
                return 'bg-success text-success-foreground';
            case 'DRAFT':
                return 'bg-muted text-muted-foreground';
            case 'REJECTED':
                return 'bg-destructive text-destructive-foreground';
            case 'WAITING_FOR_REVIEW':
                return 'bg-warning text-warning-foreground';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'VERIFIED':
                return CheckCircle;
            case 'DRAFT':
                return Edit;
            case 'REJECTED':
                return XCircle;
            case 'WAITING_FOR_REVIEW':
                return AlertCircle;
            default:
                return Clock;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto max-w-7xl px-4 py-8">
                    <div className="text-center">Loading products...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <section className="gradient-hero py-16 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-white flex justify-between items-center">
                        <div>
                            <h1 className="text-5xl font-bold mb-4">Product Management</h1>
                            <p className="text-xl text-white/90">
                                Manage your product catalog
                            </p>
                        </div>
                        <Link href={`/merchant/${params.merchantId}/products/new`}>
                            <Button className="bg-white text-primary hover:bg-white/90">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Product
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-12">
                <Card className="p-6 rounded-2xl shadow-card">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="VERIFIED">Verified</SelectItem>
                                <SelectItem value="DRAFT">Draft</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                <SelectItem value="WAITING_FOR_REVIEW">Waiting for Review</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {filteredProducts.length} of {products.length} products
                        </p>
                        <div className="flex gap-2">
                            <Badge variant="outline">
                                {products.filter(p => p.status === 'VERIFIED').length} Active
                            </Badge>
                            <Badge variant="outline">
                                {products.filter(p => p.status === 'DRAFT').length} Draft
                            </Badge>
                            <Badge variant="outline">
                                {products.filter(p => p.status === 'REJECTED').length} Rejected
                            </Badge>
                            <Badge variant="outline">
                                {products.filter(p => p.status === 'WAITING_FOR_REVIEW').length} Waiting for Review
                            </Badge>
                            <Badge variant="outline">
                                {products.filter(p => (p.inventory?.quantity ?? 0) <= (p.inventory?.lowStockThreshold ?? 0)).length} Low Stock
                            </Badge>
                        </div>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-xl font-semibold mb-2">No products found</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchQuery || statusFilter !== "ALL"
                                    ? "Try adjusting your filters"
                                    : "Start by adding your first product"}
                            </p>
                            {!searchQuery && statusFilter === "ALL" && (
                                <Link href={`/merchant/${params.merchantId}/products/new`}>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Product
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredProducts.map((product) => {
                                const StatusIcon = getStatusIcon(product.status);
                                const isLowStock = (product.inventory?.quantity ?? 0) <= (product.inventory?.lowStockThreshold ?? 0);

                                return (
                                    <div
                                        key={product.id}
                                        className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:shadow-card transition-all"
                                    >
                                        <Image
                                            src={product.images?.[0].url}
                                            alt={product.title}
                                            width={80}
                                            height={80}
                                            className="w-20 h-20 rounded-2xl object-cover"
                                        />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start gap-3 mb-2">
                                                <h3 className="font-semibold text-lg truncate flex-1">
                                                    {product.title}
                                                </h3>
                                                <Badge className={getStatusColor(product.status)}>
                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                    {product.status}
                                                </Badge>
                                                {isLowStock && (
                                                    <Badge variant="destructive">
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        Low Stock
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="font-semibold text-foreground">
                                                    ${product.price.toFixed(2)}
                                                </span>
                                                <span>•</span>
                                                <span>Stock: {product.stock}</span>
                                                <span>•</span>
                                                <span>
                                                    Category: {product.categories[0]?.category.name || 'None'}
                                                </span>
                                                <span>•</span>
                                                <span>{product._count.OrderItem} orders</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-2xl"
                                                onClick={() => router.push(`/merchant/${params.merchantId}/products/${product.id}/edit`)}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-2xl text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => {
                                                    setProductToDelete(product.id);
                                                    setDeleteDialogOpen(true);
                                                }}
                                                disabled={product._count.OrderItem > 0}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the product
                            from your catalog.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}