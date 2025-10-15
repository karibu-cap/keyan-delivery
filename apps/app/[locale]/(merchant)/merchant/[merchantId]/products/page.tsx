// app/merchant/[merchantId]/products/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProductsHeader from "@/components/merchants/products/ProductsHeader";
import ProductsContent from "@/components/merchants/products/ProductsContent";
import { ProductsContentSkeleton } from "./loading";
import { getMerchantProducts } from "@/lib/actions/server/merchants";

/**
 * Products Management Page
 * 
 * Server component with streaming for optimal performance
 * Features:
 * - Server-side data fetching
 * - ISR with 30s revalidation
 * - Streaming with Suspense
 * - Client-side filtering (instant)
 */

// Revalidate every 30 seconds (products change frequently)
export const revalidate = 30;

// Enable partial prerendering
export const experimental_ppr = true;

interface PageProps {
     params: Promise<{ merchantId: string }>;
     searchParams?: Promise<{ status?: string; search?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
     return {
          title: "Product Management",
          description: "Manage your product catalog",
     };
}

async function getProducts(merchantId: string) {
     try {
          const res = await getMerchantProducts(merchantId, { limit: 100 });

          if (!res.ok) {
               return null;
          }

          const data = await res.json();

          if (!data.success) {
               return null;
          }

          return {
               products: data.products,
               total: data.total,
          };
     } catch (error) {
          console.error('Error fetching products:', error);
          return null;
     }
}

export default async function MerchantProductsPage({
     params,
     searchParams
}: PageProps) {
     const _merchantId = (await params).merchantId;
     const _searchParams = (await searchParams)?.search;
     const _status = (await searchParams)?.status;

     const data = await getProducts(_merchantId);

     if (!data) {
          notFound();
     }

     return (
          <div className="min-h-screen bg-background">
               <Navbar />

               <ProductsHeader merchantId={_merchantId} />

               <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-12">
                    <Suspense fallback={<ProductsContentSkeleton />}>
                         <ProductsContent
                              products={data.products}
                              merchantId={_merchantId}
                              initialSearch={_searchParams}
                              initialStatus={_status}
                         />
                    </Suspense>
               </div>
          </div>
     );
}