import DashboardHeader from "@/components/merchants/DashboardHeader";
import OrdersTabs from "@/components/merchants/OrdersTabs";
import RecentProducts from "@/components/merchants/RecentProducts";
import StatsCards from "@/components/merchants/StatsCards";
import { getMerchantOrders, getMerchantProducts } from "@/lib/actions/server/merchants";
import type { Order, Product } from "@/types/merchant_types";
import { OrderStatus, ProductStatus } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { OrdersTabsSkeleton, RecentProductsSkeleton, StatsCardsSkeleton } from "./loading";
import { generateMerchantMetadata } from "@/lib/metadata";
import { getSession } from "@/lib/auth-server";
import { ROUTES } from "@/lib/router";


// Enable ISR with on-demand revalidation
export const revalidate = 60; // Revalidate every 60 seconds

interface PageProps {
     params: Promise<{
          merchantId: string;
          locale: string;
     }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
     const _merchantId = (await params).merchantId;
     const _locale = (await params).locale;

     return generateMerchantMetadata(_merchantId, _locale);
}

async function getDashboardData(merchantId: string) {
     try {
          const [activeRes, historyRes, productsRes] = await Promise.all([
               getMerchantOrders(merchantId, 'active'),
               getMerchantOrders(merchantId, 'history'),
               getMerchantProducts(merchantId, { limit: 10 })
          ]);

          if (!activeRes.ok || !historyRes.ok || !productsRes.ok) {
               return null;
          }
          const activeOrders = await activeRes.json();
          const historyOrders = await historyRes.json();
          const products = await productsRes.json();

          return {
               activeOrders: activeOrders.orders,
               historyOrders: historyOrders.orders,
               products: products.products,
               pendingCount: activeOrders.pendingCount,
               totalProducts: products.total,
          };
     } catch (error) {
          console.error('Error fetching dashboard data:', error);
          return null;
     }
}

function calculateStats(data: Awaited<ReturnType<typeof getDashboardData>>) {
     if (!data) return null;

     const today = new Date().toDateString();
     const ordersToday = data.activeOrders.filter((order: Order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate.toDateString() === today;
     }).length;

     const monthlyRevenue = data.historyOrders
          .filter((order: Order) => order.status === OrderStatus.COMPLETED)
          .reduce((sum: number, order: Order) => sum + order.orderPrices.total, 0);

     return {
          totalProducts: data.totalProducts,
          monthlyRevenue,
          ordersToday,
          storeRating: 4.8,
          activeProductsCount: data.products.filter((p: Product) => p.status === ProductStatus.VERIFIED).length,
          completedOrdersCount: data.historyOrders.filter((o: Order) => o.status === OrderStatus.COMPLETED).length,
          pendingCount: data.pendingCount,
     };
}

export default async function MerchantDashboardPage({ params }: { params: Promise<{ merchantId: string }> }) {
     const session = await getSession();
     const _params = await params;


     if (!session?.user) {
          redirect(ROUTES.signIn({ redirect: ROUTES.merchantDashboard(_params.merchantId) }));
     }
     const data = await getDashboardData(_params.merchantId);
     const stats = calculateStats(data);


     if (!data || !stats) {
          notFound();
     }


     return (
          <div className="min-h-screen bg-background">
               <DashboardHeader merchantId={_params.merchantId} />

               <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-12">
                    {/* Stats Cards with Suspense for streaming */}
                    <Suspense fallback={<StatsCardsSkeleton />}>
                         <StatsCards stats={stats} />
                    </Suspense>

                    {/* Orders Tabs with Suspense */}
                    <Suspense fallback={<OrdersTabsSkeleton />}>
                         <OrdersTabs
                              activeOrders={data.activeOrders}
                              historyOrders={data.historyOrders}
                              pendingCount={data.pendingCount}
                              merchantId={_params.merchantId}
                         />
                    </Suspense>

                    {/* Recent Products with Suspense */}
                    <Suspense fallback={<RecentProductsSkeleton />}>
                         <RecentProducts
                              products={data.products}
                              merchantId={_params.merchantId}
                         />
                    </Suspense>
               </div>
          </div>
     );
}