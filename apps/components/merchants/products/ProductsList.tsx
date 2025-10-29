"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/use-inline-translation";
import { getStatusColor, getStatusIcon, getStatusName } from "@/lib/product-utils";
import { AlertCircle, Edit, Plus } from "lucide-react";
import { OptimizedImage } from "@/components/ClsOptimization";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { IProduct } from "@/types/generic_types";

interface ProductsListProps {
     products: IProduct[];
     merchantId: string;
     searchQuery: string;
     statusFilter: string;
}

export default function ProductsList({
     products,
     merchantId,
     searchQuery,
     statusFilter,
}: ProductsListProps) {
     const router = useRouter();
     const t = useT();

     if (products.length === 0) {
          return (
               <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">{t("No products found")}</h3>
                    <p className="text-muted-foreground mb-4">
                         {searchQuery || statusFilter !== "ALL"
                              ? t("Try adjusting your filters")
                              : t("Start by adding your first product")}
                    </p>
                    {!searchQuery && statusFilter === "ALL" && (
                         <Link href={`/merchant/${merchantId}/products/new`}>
                              <Button>
                                   <Plus className="w-4 h-4 mr-2" />
                                   {t("Add Product")}
                              </Button>
                         </Link>
                    )}
               </div>
          );
     }

     return (
          <div className="space-y-3">
               {products.map((product) => {
                    const StatusIcon = getStatusIcon(product.status);
                    const isLowStock = (product.inventory?.quantity ?? 0) <=
                         (product.inventory?.lowStockThreshold ?? 0);

                    return (
                         <div
                              key={product.id}
                              className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:shadow-card transition-all"
                         >
                              <div className="relative">
                                   <OptimizedImage
                                        src={product.images?.[0]?.url || '/placeholder-product.jpg'}
                                        alt={product.title}
                                        width={80}
                                        height={80}
                                        className="w-20 h-20 rounded-2xl object-cover"
                                   />
                                   {isLowStock && (
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center">
                                             <AlertCircle className="w-4 h-4 text-white" />
                                        </div>
                                   )}
                              </div>

                              <div className="flex-1 min-w-0">
                                   <div className="flex items-start gap-3 mb-2 flex-wrap">
                                        <h3 className="font-semibold text-lg truncate flex-1 min-w-[200px]">
                                             {product.title}
                                        </h3>
                                        <div className="flex gap-2 flex-wrap">
                                             <Badge className={getStatusColor(product.status)}>
                                                  <StatusIcon className="w-3 h-3 mr-1" />
                                                  {getStatusName(product.status)}
                                             </Badge>
                                             {isLowStock && (
                                                  <Badge variant="destructive">
                                                       <AlertCircle className="w-3 h-3 mr-1" />
                                                       {t("Low Stock")}
                                                  </Badge>
                                             )}
                                        </div>
                                   </div>

                                   <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                        <span className="font-semibold text-foreground text-base">
                                             {t.formatAmount(product.price)}
                                        </span>
                                        <span className="hidden sm:inline">•</span>
                                        <span>Stock: {product.inventory?.stockQuantity}</span>
                                        <span className="hidden sm:inline">•</span>
                                        <span className="truncate max-w-[150px]">
                                             {product?.categories?.[0]?.category?.name || 'Uncategorized'}
                                        </span>
                                        <span className="hidden md:inline">•</span>
                                        <span className="hidden md:inline">
                                             {product?._count?.OrderItem} {t("orders")}
                                        </span>
                                   </div>
                              </div>

                              <div className="flex gap-2">
                                   <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-2xl"
                                        onClick={() => router.push(`/merchant/${merchantId}/products/${product.id}/edit`)}
                                   >
                                        <Edit className="w-4 h-4" />
                                   </Button>
                              </div>
                         </div>
                    );
               })}
          </div>
     );
}