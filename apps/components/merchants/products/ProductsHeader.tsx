import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import { getServerT } from "@/i18n/server-translations";


interface ProductsHeaderProps {
     merchantId: string;
}

export default async function ProductsHeader({ merchantId }: ProductsHeaderProps) {
     const t = await getServerT();

     return (
          <section className="gradient-hero py-8 sm:py-12 lg:py-16 px-4">
               <div className="container mx-auto max-w-7xl">
                    <div className="text-white">
                         {/* Header with Icon */}
                         <div className="flex items-center gap-3 mb-4 sm:mb-6">
                              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                   <Package className="w-6 h-6 sm:w-7 sm:h-7" />
                              </div>
                              <div className="flex-1 min-w-0">
                                   <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold truncate">
                                        {t("Product Management")}
                                   </h1>
                                   <p className="text-sm sm:text-base lg:text-lg text-white/90 mt-1">
                                        {t("Manage your product catalog")}
                                   </p>
                              </div>
                         </div>

                         {/* Add Product Button */}
                         <Link href={`/merchant/${merchantId}/products/new`} className="inline-block w-full sm:w-auto">
                              <Button className="w-full sm:w-auto bg-white text-primary hover:bg-white/90">
                                   <Plus className="w-4 h-4 mr-2" />
                                   {t("Add Product")}
                              </Button>
                         </Link>
                    </div>
               </div>
          </section>
     );
}