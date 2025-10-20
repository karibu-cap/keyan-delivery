import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3 } from "lucide-react";
import { getT } from "@/i18n/server-translations";
import { getLocale } from "next-intl/server";

interface DashboardHeaderProps {
     merchantId: string;
}

export default async function DashboardHeader({ merchantId }: DashboardHeaderProps) {
     const local = await getLocale()
     const t = await getT(local)
     return (
          <section className="gradient-hero py-16 px-4">
               <div className="container mx-auto max-w-7xl">
                    <div className="text-white flex justify-between items-center">
                         <div>
                              <h1 className="text-5xl font-bold mb-4">{t("Welcome Back To Your Dashboard")}</h1>
                              <p className="text-xl text-white/90">
                                   {t("Manage your store, products, and orders")}
                              </p>
                         </div>
                         <div className="flex gap-3">
                              <Link href={`/merchant/${merchantId}/insights`}>
                                   <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                                        <BarChart3 className="w-4 h-4 mr-2" />
                                        {t("Insights")}
                                   </Button>
                              </Link>
                              <Link href={`/merchant/${merchantId}/products/new`}>
                                   <Button className="bg-white text-primary hover:bg-white/90">
                                        <Plus className="w-4 h-4 mr-2" />
                                        {t("Add Product")}
                                   </Button>
                              </Link>
                         </div>
                    </div>
               </div>
          </section>
     );
}