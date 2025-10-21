import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3 } from "lucide-react";
import { getServerT } from "@/i18n/server-translations";

import { SlideUp } from "./animations/TransitionWrappers";

interface DashboardHeaderProps {
     merchantId: string;
}

export default async function DashboardHeader({ merchantId }: DashboardHeaderProps) {

     const t = await getServerT()

     return (
          <section className="gradient-hero py-8 sm:py-12 lg:py-16 px-4">
               <SlideUp>
                    <div className="container mx-auto max-w-7xl">
                         <div className="text-white">
                              {/* Header Title */}
                              <div className="mb-6">
                                   <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-2 sm:mb-4">
                                        {t("Welcome Back To Your Dashboard")}
                                   </h1>
                                   <p className="text-base sm:text-lg lg:text-xl text-white/90">
                                        {t("Manage your store, products, and orders")}
                                   </p>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-col sm:flex-row gap-3">
                                   <Link href={`/merchant/${merchantId}/insights`} className="w-full sm:w-auto">
                                        <Button
                                             variant="outline"
                                             className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20"
                                        >
                                             <BarChart3 className="w-4 h-4 mr-2" />
                                             {t("Insights")}
                                        </Button>
                                   </Link>
                                   <Link href={`/merchant/${merchantId}/products/new`} className="w-full sm:w-auto">
                                        <Button className="w-full sm:w-auto bg-white text-primary hover:bg-white/90">
                                             <Plus className="w-4 h-4 mr-2" />
                                             {t("Add Product")}
                                        </Button>
                                   </Link>
                              </div>
                         </div>
                    </div>
               </SlideUp>
          </section>
     );
}