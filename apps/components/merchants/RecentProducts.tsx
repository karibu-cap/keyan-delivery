"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type { Product } from "@/types/merchant_types";


interface RecentProductsProps {
     products: Product[];
     merchantId: string;
}

export default function RecentProducts({ products, merchantId }: RecentProductsProps) {
     const router = useRouter();

     return (
          <Card className="p-6 rounded-2xl shadow-card mt-8">
               <div className="flex items-center justify-between mb-6">
                    <div>
                         <h2 className="text-2xl font-bold mb-1">Recent Products</h2>
                         <p className="text-muted-foreground">Your latest products</p>
                    </div>
                    <Link href={`/merchant/${merchantId}/products`}>
                         <Button variant="outline">View All Products</Button>
                    </Link>
               </div>

               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.slice(0, 6).map((product) => (
                         <div
                              key={product.id}
                              className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:shadow-card transition-all cursor-pointer"
                              onClick={() => router.push(`/merchant/${merchantId}/products/${product.id}`)}
                         >
                              <div className="relative w-16 h-16">
                                   <Image
                                        src={product.images[0]?.url}
                                        blurDataURL={product.images[0]?.blurDataUrl ?? undefined}
                                        alt={product.title}
                                        fill
                                        className="w-16 h-16 rounded-2xl object-cover"
                                   />
                              </div>
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
     );
}