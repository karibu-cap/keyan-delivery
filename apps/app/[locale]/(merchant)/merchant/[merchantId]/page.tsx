"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Package,
    DollarSign,
    TrendingUp,
    Store,
    Plus,
    Clock,
    CheckCircle,
    AlertCircle,
    ChefHat,
    Truck,
    XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { getMerchantOrders, getMerchantProducts, updateOrderStatus } from "@/lib/actions/merchants";
import { OrderStatus } from "@prisma/client";
import { IProduct } from "@/lib/actions/stores";

interface Order {
    id: string;
    status: string;
    createdAt: string;
    orderPrices: {
        total: number;
        subtotal: number;
        deliveryFee: number;
    };
    items: Array<{
        id: string;
        quantity: number;
        price: number;
        product: {
            title: string;
            media: {
                url: string;
            };
        };
    }>;
    user: {
        fullName: string;
        phone: string;
    };
    deliveryInfo: {
        address: string;
        deliveryContact: string;
    };
    pickupCode?: string;
}

interface Product {
    id: string;
    title: string;
    price: number;
    stock: number;
    status: string;
    media: {
        url: string;
    };
    _count: {
        OrderItem: number;
        cartItems: number;
    };
}

export default function MerchantDashboardPage() {
    const params = useParams<{ merchantId: string }>();
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);
    const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<IProduct[]>([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [stats, setStats] = useState({
        totalProducts: 0,
        monthlyRevenue: 0,
        ordersToday: 0,
        storeRating: 4.8
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const [activeRes, historyRes, productsRes] = await Promise.all([
                getMerchantOrders(params.merchantId, 'active'),
                getMerchantOrders(params.merchantId, 'history'),
                getMerchantProducts(params.merchantId, { limit: 10 })
            ]);

            const activeData = await activeRes;
            const historyData = await historyRes;
            const productsData = await productsRes;

            if (activeData.success) {
                setActiveOrders(activeData.orders);
                setPendingCount(activeData.pendingCount);
            }

            if (historyData.success) {
                setHistoryOrders(historyData.orders);
            }

            if (productsData.success) {
                setProducts(productsData.products);
                setStats(prev => ({
                    ...prev,
                    totalProducts: productsData.total,
                    ordersToday: activeData.orders.filter((o: Order) => {
                        const orderDate = new Date(o.createdAt);
                        const today = new Date();
                        return orderDate.toDateString() === today.toDateString();
                    }).length,
                    monthlyRevenue: historyData.orders
                        .filter((o: Order) => o.status === 'COMPLETED')
                        .reduce((sum: number, o: Order) => sum + o.orderPrices.total, 0)
                }));
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load dashboard data',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            const res = await updateOrderStatus(orderId, newStatus as OrderStatus, params.merchantId);

            if (res.success) {
                toast({
                    title: 'Success',
                    description: res.message,
                    variant: 'default'
                });
                fetchDashboardData();
            } else {
                toast({
                    title: 'Error',
                    variant: 'destructive'
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update order status',
                variant: 'destructive'
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-500';
            case 'ACCEPTED_BY_MERCHANT':
            case 'IN_PREPARATION':
                return 'bg-blue-500';
            case 'READY_TO_DELIVER':
                return 'bg-purple-500';
            case 'ACCEPTED_BY_DRIVER':
            case 'ON_THE_WAY':
                return 'bg-indigo-500';
            case 'COMPLETED':
                return 'bg-green-500';
            case 'CANCELED_BY_MERCHANT':
            case 'CANCELED_BY_DRIVER':
            case 'REJECTED_BY_MERCHANT':
            case 'REJECTED_BY_DRIVER':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING':
                return Clock;
            case 'ACCEPTED_BY_MERCHANT':
                return CheckCircle;
            case 'IN_PREPARATION':
                return ChefHat;
            case 'READY_TO_DELIVER':
                return Package;
            case 'ACCEPTED_BY_DRIVER':
            case 'ON_THE_WAY':
                return Truck;
            case 'COMPLETED':
                return CheckCircle;
            default:
                return XCircle;
        }
    };

    const getNextStatus = (currentStatus: string) => {
        switch (currentStatus) {
            case 'PENDING':
                return 'ACCEPTED_BY_MERCHANT';
            case 'ACCEPTED_BY_MERCHANT':
                return 'IN_PREPARATION';
            case 'IN_PREPARATION':
                return 'READY_TO_DELIVER';
            default:
                return null;
        }
    };

    const canReject = (status: string) => {
        return status === 'PENDING';
    };

    const canCancel = (status: string) => {
        return ['ACCEPTED_BY_MERCHANT', 'IN_PREPARATION', 'READY_TO_DELIVER'].includes(status);
    };

    const statCards = [
        {
            label: "Total Products",
            value: stats.totalProducts.toString(),
            icon: Package,
            change: `${products.filter(p => p.status === 'VERIFIED').length} active`
        },
        {
            label: "Monthly Revenue",
            value: `${stats.monthlyRevenue.toFixed(2)}`,
            icon: DollarSign,
            change: `${historyOrders.filter(o => o.status === 'COMPLETED').length} completed`
        },
        {
            label: "Orders Today",
            value: stats.ordersToday.toString(),
            icon: TrendingUp,
            change: `${pendingCount} pending`
        },
        {
            label: "Store Rating",
            value: stats.storeRating.toString(),
            icon: Store,
            change: "★"
        },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto max-w-7xl px-4 py-8">
                    <div className="text-center">Loading...</div>
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
                            <h1 className="text-5xl font-bold mb-4">Merchant Dashboard</h1>
                            <p className="text-xl text-white/90">
                                Manage your store, products, and orders
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
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat, index) => (
                        <Card
                            key={stat.label}
                            className="p-6 rounded-2xl shadow-card animate-slide-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl gradient-hero flex items-center justify-center">
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    {stat.change}
                                </Badge>
                            </div>
                            <div className="text-3xl font-bold mb-1">{stat.value}</div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </Card>
                    ))}
                </div>

                <Tabs defaultValue="active" className="space-y-6">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="active" className="relative">
                            Active Orders
                            {pendingCount > 0 && (
                                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                                    {pendingCount}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="space-y-4">
                        {activeOrders.length === 0 ? (
                            <Card className="p-12 rounded-2xl shadow-card text-center">
                                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-xl font-semibold mb-2">No active orders</h3>
                                <p className="text-muted-foreground">
                                    New orders will appear here
                                </p>
                            </Card>
                        ) : (
                            activeOrders.map((order) => {
                                const StatusIcon = getStatusIcon(order.status);
                                const isPending = order.status === 'PENDING';

                                return (
                                    <Card
                                        key={order.id}
                                        className={`p-6 rounded-2xl shadow-card transition-all ${isPending ? 'ring-2 ring-yellow-500 ring-offset-2' : ''
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold">
                                                        Order #{order.id.slice(-8)}
                                                    </h3>
                                                    <Badge className={`${getStatusColor(order.status)} text-white`}>
                                                        <StatusIcon className="w-3 h-3 mr-1" />
                                                        {order.status.replace(/_/g, ' ')}
                                                    </Badge>
                                                    {isPending && (
                                                        <Badge variant="destructive" className="animate-pulse">
                                                            <AlertCircle className="w-3 h-3 mr-1" />
                                                            Action Required
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-sm text-muted-foreground space-y-1">
                                                    <p><strong>Customer:</strong> {order.user.fullName} - {order.user.phone}</p>
                                                    <p><strong>Address:</strong> {order.deliveryInfo.address}</p>
                                                    <p><strong>Contact:</strong> {order.deliveryInfo.deliveryContact}</p>
                                                    <p><strong>Order Time:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                                                    {order.pickupCode && (
                                                        <p><strong>Pickup Code:</strong>
                                                            <span className="ml-2 font-mono text-lg text-primary">{order.pickupCode}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-primary">
                                                    ${order.orderPrices.total.toFixed(2)}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                                    <img
                                                        src={item.product.media.url}
                                                        alt={item.product.title}
                                                        className="w-12 h-12 rounded-lg object-cover"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium">{item.product.title}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Qty: {item.quantity} × ${item.price.toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <div className="font-semibold">
                                                        ${(item.quantity * item.price).toFixed(2)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex gap-2 pt-4 border-t">
                                            {getNextStatus(order.status) && (
                                                <Button
                                                    onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status)!)}
                                                    className="flex-1"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    {getNextStatus(order.status) === 'ACCEPTED_BY_MERCHANT' && 'Accept Order'}
                                                    {getNextStatus(order.status) === 'IN_PREPARATION' && 'Start Preparation'}
                                                    {getNextStatus(order.status) === 'READY_TO_DELIVER' && 'Mark Ready for Pickup'}
                                                </Button>
                                            )}

                                            {canReject(order.status) && (
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => handleStatusUpdate(order.id, 'REJECTED_BY_MERCHANT')}
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Reject
                                                </Button>
                                            )}

                                            {canCancel(order.status) && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleStatusUpdate(order.id, 'CANCELED_BY_MERCHANT')}
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Cancel
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                );
                            })
                        )}
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                        {historyOrders.length === 0 ? (
                            <Card className="p-12 rounded-2xl shadow-card text-center">
                                <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-xl font-semibold mb-2">No order history</h3>
                                <p className="text-muted-foreground">
                                    Completed and cancelled orders will appear here
                                </p>
                            </Card>
                        ) : (
                            historyOrders.map((order) => {
                                const StatusIcon = getStatusIcon(order.status);

                                return (
                                    <Card key={order.id} className="p-6 rounded-2xl shadow-card">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold">
                                                        Order #{order.id.slice(-8)}
                                                    </h3>
                                                    <Badge className={`${getStatusColor(order.status)} text-white`}>
                                                        <StatusIcon className="w-3 h-3 mr-1" />
                                                        {order.status.replace(/_/g, ' ')}
                                                    </Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground space-y-1">
                                                    <p><strong>Customer:</strong> {order.user.fullName}</p>
                                                    <p><strong>Completed:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold">
                                                    ${order.orderPrices.total.toFixed(2)}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {order.items.slice(0, 4).map((item) => (
                                                <div key={item.id} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                                                    <img
                                                        src={item.product.media.url}
                                                        alt={item.product.title}
                                                        className="w-10 h-10 rounded object-cover"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium truncate">{item.product.title}</p>
                                                        <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                );
                            })
                        )}
                    </TabsContent>
                </Tabs>

                <Card className="p-6 rounded-2xl shadow-card mt-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Recent Products</h2>
                            <p className="text-muted-foreground">Your latest products</p>
                        </div>
                        <Link href={`/merchant/${params.merchantId}/products`}>
                            <Button variant="outline">View All Products</Button>
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products.slice(0, 6).map((product) => (
                            <div
                                key={product.id}
                                className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:shadow-card transition-all cursor-pointer"
                                onClick={() => router.push(`/merchant/${params.merchantId}/products/${product.id}`)}
                            >
                                <img
                                    src={product.images[0].url}
                                    alt={product.title}
                                    className="w-16 h-16 rounded-2xl object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold truncate">{product.title}</h3>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                        <span>${product.price.toFixed(2)}</span>
                                        <span>•</span>
                                        <span>Stock: {product.stock}</span>
                                    </div>
                                    <Badge
                                        variant={product.status === 'VERIFIED' ? 'default' : 'secondary'}
                                        className="mt-2"
                                    >
                                        {product.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}