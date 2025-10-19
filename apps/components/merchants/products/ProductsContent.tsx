"use client";

import { Card } from "@/components/ui/card";
import { IProduct } from "@/lib/actions/server/stores";
import { useMemo, useState } from "react";
import ProductsFilters from "./ProductsFilters";
import ProductsList from "./ProductsList";
import ProductsStats from "./ProductsStats";

interface ProductsContentProps {
     products: IProduct[];
     merchantId: string;
     initialSearch?: string;
     initialStatus?: string;
}

export default function ProductsContent({
     products,
     merchantId,
     initialSearch = "",
     initialStatus = "ALL"
}: ProductsContentProps) {

     const [searchQuery, setSearchQuery] = useState(initialSearch);
     const [statusFilter, setStatusFilter] = useState(initialStatus);

     // Memoized filtering for better performance
     const filteredProducts = useMemo(() => {
          let filtered = products;

          if (searchQuery) {
               const query = searchQuery.toLowerCase();
               filtered = filtered.filter(p =>
                    p.title.toLowerCase().includes(query) ||
                    p.categories[0]?.category.name.toLowerCase().includes(query)
               );
          }

          if (statusFilter !== "ALL") {
               filtered = filtered.filter(p => p.status === statusFilter);
          }

          return filtered;
     }, [products, searchQuery, statusFilter]);

     // Stats calculations
     const stats = useMemo(() => ({
          verified: products.filter(p => p.status === 'VERIFIED').length,
          draft: products.filter(p => p.status === 'DRAFT').length,
          rejected: products.filter(p => p.status === 'REJECTED').length,
          waitingForReview: products.filter(p => p.status === 'WAITING_FOR_REVIEW').length,
          lowStock: products.filter(p =>
               (p.inventory?.quantity ?? 0) <= (p.inventory?.lowStockThreshold ?? 0)
          ).length,
     }), [products]);

     return (
          <>
               <Card className="p-6 rounded-2xl shadow-card">
                    <ProductsFilters
                         searchQuery={searchQuery}
                         statusFilter={statusFilter}
                         onSearchChange={setSearchQuery}
                         onStatusChange={setStatusFilter}
                    />

                    <ProductsStats
                         stats={stats}
                         totalProducts={products.length}
                         filteredCount={filteredProducts.length}
                    />

                    <ProductsList
                         products={filteredProducts}
                         merchantId={merchantId}
                         searchQuery={searchQuery}
                         statusFilter={statusFilter}
                    />
               </Card>

          </>
     );
}