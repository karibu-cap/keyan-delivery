import ProductsContent from "@/components/merchants/products/ProductsContent";
import ProductsHeader from "@/components/merchants/products/ProductsHeader";
import { getMerchantProducts } from "@/lib/actions/server/merchants";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductsContentSkeleton } from "./loading";

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

          if (!res) {
               return null;
          }

          return {
               products: res.products,
               total: res.total,
          };
     } catch (error) {
          console.error({ message: 'Error fetching products:', error });
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