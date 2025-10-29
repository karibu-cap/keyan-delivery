import DashboardHeader from "@/components/merchants/DashboardHeader";
import RecentProducts from "@/components/merchants/RecentProducts";
import StatsCards from "@/components/merchants/StatsCards";
import { getMerchantOrders, getMerchantProducts } from "@/lib/actions/server/merchants";
import { OrderStatus, ProductStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { generateMerchantMetadata } from "@/lib/metadata";
import { getSession } from "@/lib/auth-server";
import { ROUTES } from "@/lib/router";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { OrdersTabsClient } from "@/components/merchants/OrdersTabsClient";
import { OrdersTabsSkeleton, RecentProductsSkeleton, StatsCardsSkeleton } from "@/components/merchants/MerchantsSkeleton";


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


function calculateStats(
     orders: Awaited<ReturnType<typeof getMerchantOrders>>,
     products: Awaited<ReturnType<typeof getMerchantProducts>>
) {
     const today = new Date().toDateString();
     const ordersToday = orders?.activeOrders?.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate.toDateString() === today;
     }).length;

     const monthlyRevenue = orders?.historyOrders
          .filter((order) => order.status === OrderStatus.COMPLETED)
          .reduce((sum, order) => sum + order.orderPrices.total, 0);

     return {
          totalProducts: products?.products.length ?? 0,
          monthlyRevenue: monthlyRevenue ?? 0,
          ordersToday: ordersToday ?? 0,
          storeRating: 4.8,
          activeProductsCount: products?.products.filter(
               (p) => p.status === ProductStatus.VERIFIED
          ).length ?? 0,
          completedOrdersCount: orders?.historyOrders.filter(
               (o) => o.status === OrderStatus.COMPLETED
          ).length ?? 0,
          pendingCount: orders?.pendingCount ?? 0,
     };
}
export default async function MerchantDashboardPage({ params }: { params: Promise<{ merchantId: string }> }) {
     const session = await getSession();
     const _params = await params;

     if (!session?.user) {
          redirect(ROUTES.signIn({ redirect: ROUTES.merchantDashboard(_params.merchantId) }));
     }

     const queryClient = new QueryClient();

     await queryClient.prefetchQuery({
          queryKey: ['merchant-orders', _params.merchantId],
          queryFn: () => getMerchantOrders(_params.merchantId),
     });


     const products = await getMerchantProducts(_params.merchantId);
     const ordersData = queryClient.getQueryData<Awaited<ReturnType<typeof getMerchantOrders>>>(['merchant-orders', _params.merchantId]);

     const stats = calculateStats(ordersData, products);


     return (
          <HydrationBoundary state={dehydrate(queryClient)}>
               <div className="min-h-screen bg-background">
                    <DashboardHeader merchantId={_params.merchantId} />

                    <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-12">
                         {/* Stats Cards with Suspense for streaming */}
                         <Suspense fallback={<StatsCardsSkeleton />}>
                              <StatsCards stats={stats} />
                         </Suspense>

                         {/* Orders Tabs with Suspense */}
                         <Suspense fallback={<OrdersTabsSkeleton />}>
                              <OrdersTabsClient
                                   merchantId={_params.merchantId}
                              />
                         </Suspense>

                         {/* Recent Products with Suspense */}
                         <Suspense fallback={<RecentProductsSkeleton />}>
                              <RecentProducts
                                   products={products?.products ?? []}
                                   merchantId={_params.merchantId}
                              />
                         </Suspense>
                    </div>
               </div>
          </HydrationBoundary>
     );
}