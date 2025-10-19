import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getT } from "@/i18n/server-translations";
import { Package } from "lucide-react";
import { getLocale } from "next-intl/server";
import Link from "next/link";

/**
 * 404 page for products
 */
export default async function ProductsNotFound() {
     const local = await getLocale()
     const t = await getT(local)
     return (
          <div className="min-h-screen bg-background">

               <section className="gradient-hero py-16 px-4">
                    <div className="container mx-auto max-w-7xl">
                         <h1 className="text-5xl font-bold mb-4 text-white">
                              {t("Products Not Found")}
                         </h1>
                    </div>
               </section>

               <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-12">
                    <Card className="p-12 rounded-2xl shadow-card text-center">
                         <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                         <h2 className="text-2xl font-bold mb-2">{t("Products Not Found")}</h2>
                         <p className="text-muted-foreground mb-6">
                              {t("We couldn't find the products you're looking for.")}
                         </p>
                         <Link href="/">
                              <Button>
                                   {t("Go to Home")}
                              </Button>
                         </Link>
                    </Card>
               </div>
          </div>
     );
}