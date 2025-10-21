import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getServerT } from "@/i18n/server-translations";



/**
 * Loading UI displayed while fetching dashboard data
 * Provides instant feedback to users
 */
export default async function MerchantDashboardLoading() {

     const t = await getServerT()

     return (
          <div className="min-h-screen bg-background">

               <section className="gradient-hero py-16 px-4">
                    <div className="container mx-auto max-w-7xl">
                         <div className="text-white">
                              <h1 className="text-5xl font-bold mb-4">{t("Merchant Dashboard")}</h1>
                              <p className="text-xl text-white/90">
                                   {t("Loading your dashboard...")}
                              </p>
                         </div>
                    </div>
               </section>

               <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-12">
                    <StatsCardsSkeleton />
                    <OrdersTabsSkeleton />
                    <RecentProductsSkeleton />
               </div>
          </div>
     );
}

export function StatsCardsSkeleton() {
     return (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
               {[...Array(4)].map((_, i) => (
                    <Card key={i} className="p-6 rounded-2xl shadow-card">
                         <div className="flex items-start justify-between mb-4">
                              <Skeleton className="w-12 h-12 rounded-2xl" />
                              <Skeleton className="h-5 w-16" />
                         </div>
                         <Skeleton className="h-9 w-20 mb-2" />
                         <Skeleton className="h-4 w-32" />
                    </Card>
               ))}
          </div>
     );
}

export function OrdersTabsSkeleton() {
     return (
          <div className="space-y-6">
               <div className="flex gap-2">
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-10 w-40" />
               </div>

               <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                         <Card key={i} className="p-6 rounded-2xl shadow-card">
                              <div className="flex items-start justify-between mb-4">
                                   <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                             <Skeleton className="h-6 w-32" />
                                             <Skeleton className="h-6 w-24" />
                                        </div>
                                        <div className="space-y-2">
                                             <Skeleton className="h-4 w-full max-w-md" />
                                             <Skeleton className="h-4 w-full max-w-sm" />
                                             <Skeleton className="h-4 w-full max-w-lg" />
                                        </div>
                                   </div>
                                   <div className="text-right space-y-2">
                                        <Skeleton className="h-8 w-24" />
                                        <Skeleton className="h-4 w-16" />
                                   </div>
                              </div>

                              <div className="space-y-2 mb-4">
                                   {[...Array(2)].map((_, j) => (
                                        <div key={j} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                             <Skeleton className="w-12 h-12 rounded-lg" />
                                             <div className="flex-1 space-y-2">
                                                  <Skeleton className="h-4 w-32" />
                                                  <Skeleton className="h-3 w-24" />
                                             </div>
                                             <Skeleton className="h-5 w-16" />
                                        </div>
                                   ))}
                              </div>

                              <div className="flex gap-2 pt-4 border-t">
                                   <Skeleton className="h-10 flex-1" />
                                   <Skeleton className="h-10 w-24" />
                              </div>
                         </Card>
                    ))}
               </div>
          </div>
     );
}

export function RecentProductsSkeleton() {
     return (
          <Card className="p-6 rounded-2xl shadow-card mt-8">
               <div className="flex items-center justify-between mb-6">
                    <div className="space-y-2">
                         <Skeleton className="h-7 w-48" />
                         <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-10 w-40" />
               </div>

               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                         <div
                              key={i}
                              className="flex items-center gap-4 p-4 rounded-2xl border border-border"
                         >
                              <Skeleton className="w-16 h-16 rounded-2xl" />
                              <div className="flex-1 space-y-2">
                                   <Skeleton className="h-5 w-full" />
                                   <Skeleton className="h-4 w-24" />
                                   <Skeleton className="h-5 w-20" />
                              </div>
                         </div>
                    ))}
               </div>
          </Card>
     );
}