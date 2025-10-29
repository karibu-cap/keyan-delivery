import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OptimizedImage } from "@/components/ClsOptimization";
import { Package } from "lucide-react";
import Link from "next/link";
import { getServerT } from "@/i18n/server-translations";

import { SlideUp, StaggerChildren, StaggerItem } from "./animations/TransitionWrappers";
import type { IProduct } from "@/types/generic_types";

interface RecentProductsProps {
     products: IProduct[];
     merchantId: string;
}

export default async function RecentProducts({ products, merchantId }: RecentProductsProps) {
     const t = await getServerT();

     if (!products || products.length === 0) {
          return null;
     }

     return (
          <SlideUp delay={0.3}>
               <Card className="p-4 sm:p-6 rounded-2xl shadow-card mt-6 sm:mt-8">
                    <CardHeader className="p-0 mb-4 sm:mb-6">
                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div>
                                   <CardTitle className="text-xl sm:text-2xl">{t("Recent Products")}</CardTitle>
                                   <p className="text-sm text-muted-foreground mt-1">
                                        {t("Your latest products")}
                                   </p>
                              </div>
                              <Link href={`/merchant/${merchantId}/products`}>
                                   <Button variant="outline" className="w-full sm:w-auto">
                                        <Package className="w-4 h-4 mr-2" />
                                        {t("View All Products")}
                                   </Button>
                              </Link>
                         </div>
                    </CardHeader>

                    <CardContent className="p-0">
                         <StaggerChildren staggerDelay={0.05} className="space-y-4">

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                   {products.map((product) => (
                                        <StaggerItem key={product.id}>
                                             <Link
                                                  key={product.id}
                                                  href={`/merchant/${merchantId}/products/${product.id}`}
                                                  className="block"
                                             >
                                                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-border hover:bg-accent/50 transition-colors">
                                                       <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg sm:rounded-2xl overflow-hidden flex-shrink-0">
                                                            {product.images && product.images[0] ? (
                                                                 <OptimizedImage
                                                                      src={product.images[0].url}
                                                                      blurDataURL={product.images[0].blurDataUrl ?? undefined}
                                                                      alt={product.title}
                                                                      fill
                                                                      className="object-cover"
                                                                 />
                                                            ) : (
                                                                 <div className="w-full h-full bg-muted flex items-center justify-center">
                                                                      <Package className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                                                                 </div>
                                                            )}
                                                       </div>
                                                       <div className="flex-1 min-w-0">
                                                            <h4 className="font-medium text-sm sm:text-base mb-1 truncate">
                                                                 {product.title}
                                                            </h4>
                                                            <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                                                                 {t("Stock")}: {product.inventory?.quantity ?? 0}
                                                            </p>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                 <span className="font-bold text-sm sm:text-base">
                                                                      {t.formatAmount(product.price)}
                                                                 </span>
                                                                 <Badge
                                                                      variant={product.status === 'VERIFIED' ? 'default' : 'secondary'}
                                                                      className="text-xs"
                                                                 >
                                                                      {product.status}
                                                                 </Badge>
                                                            </div>
                                                       </div>
                                                  </div>
                                             </Link>
                                        </StaggerItem>
                                   ))}
                              </div>
                         </StaggerChildren>

                    </CardContent>
               </Card>
          </SlideUp>
     );
}