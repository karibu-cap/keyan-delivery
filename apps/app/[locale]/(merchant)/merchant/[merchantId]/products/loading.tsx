import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getServerT } from "@/i18n/server-translations";


/**
 * Loading UI for products page
 * Displayed instantly while fetching data
 */
export default async function ProductsLoading() {

     const t = await getServerT()

     return (
          <div className="min-h-screen bg-background">

               <section className="gradient-hero py-16 px-4">
                    <div className="container mx-auto max-w-7xl">
                         <div className="text-white flex justify-between items-center">
                              <div>
                                   <h1 className="text-5xl font-bold mb-4">{t("Product Management")}</h1>
                                   <p className="text-xl text-white/90">
                                        {t("Loading your products...")}
                                   </p>
                              </div>
                              <Skeleton className="h-10 w-40 bg-white/20" />
                         </div>
                    </div>
               </section>

               <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-12">
                    <ProductsContentSkeleton />
               </div>
          </div>
     );
}

export function ProductsContentSkeleton() {
     return (
          <Card className="p-6 rounded-2xl shadow-card">
               {/* Filters Skeleton */}
               <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-full md:w-48" />
               </div>

               {/* Stats Skeleton */}
               <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
                    <Skeleton className="h-5 w-48" />
                    <div className="flex gap-2">
                         {[...Array(5)].map((_, i) => (
                              <Skeleton key={i} className="h-6 w-20" />
                         ))}
                    </div>
               </div>

               {/* Products List Skeleton */}
               <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                         <div
                              key={i}
                              className="flex items-center gap-4 p-4 rounded-2xl border border-border"
                         >
                              <Skeleton className="w-20 h-20 rounded-2xl" />

                              <div className="flex-1 space-y-3">
                                   <div className="flex items-start gap-3">
                                        <Skeleton className="h-6 flex-1 max-w-xs" />
                                        <Skeleton className="h-6 w-24" />
                                   </div>

                                   <div className="flex items-center gap-4">
                                        <Skeleton className="h-5 w-16" />
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-24" />
                                   </div>
                              </div>

                              <Skeleton className="w-10 h-10 rounded-2xl" />
                         </div>
                    ))}
               </div>
          </Card>
     );
}