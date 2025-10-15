import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getT } from "@/lib/server-translations";
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
                              <h1 className="text-5xl font-bold mb-4">{t("Merchant Dashboard")}</h1>
                              <p className="text-xl text-white/90">
                                   {t("Manage your store, products, and orders")}
                              </p>
                         </div>
                         <Link href={`/merchant/${merchantId}/products/new`}>
                              <Button className="bg-white text-primary hover:bg-white/90">
                                   <Plus className="w-4 h-4 mr-2" />
                                   {t("Add Product")}
                              </Button>
                         </Link>
                    </div>
               </div>
          </section>
     );
}