"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useT } from "@/hooks/use-inline-translation";
import type { Product } from "@/types/merchant_types";
import Link from "next/link";
import { OptimizedImage } from "../ClsOptimization";


interface RecentProductsProps {
     products: Product[];
     merchantId: string;
}

export default function RecentProducts({ products, merchantId }: RecentProductsProps) {
     const t = useT()

     return (
          <Card className="p-6 rounded-2xl shadow-card mt-8">
               <div className="flex items-center justify-between mb-6">
                    <div>
                         <h2 className="text-2xl font-bold mb-1">{t("Recent Products")}</h2>
                         <p className="text-muted-foreground">{t("Your latest products")}</p>
                    </div>
                    <Link href={`/merchant/${merchantId}/products`}>
                         <Button variant="outline">{t("View All Products")}</Button>
                    </Link>
               </div>

               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.slice(0, 6).map((product) => (
                         <div
                              key={product.id}
                              className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:shadow-card transition-all"
                         >
                              <div className="relative w-16 h-16">
                                   <OptimizedImage
                                        src={product.images[0]?.url}
                                        blurDataURL={product.images[0]?.blurDataUrl ?? undefined}
                                        alt={product.title}
                                        width={64}
                                        height={64}
                                        className="w-16 h-16 rounded-2xl object-cover"
                                   />
                              </div>
                              <div className="flex-1 min-w-0">
                                   <h3 className="font-semibold truncate">{product.title}</h3>
                                   <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                        <span>${product.price.toFixed(2)}</span>
                                        <span>•</span>
                                        <span>{t("Stock: ") + product.stock}</span>
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
     );
}