import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Store } from "lucide-react";
import Navbar from "@/components/Navbar";
import { getT } from "@/lib/server-translations";
import { getLocale } from "next-intl/server";

/**
 * 404 page for merchant dashboard
 * Shown when merchant ID is invalid
 */
export default async function MerchantNotFound() {
     const local = await getLocale()
     const t = await getT(local)
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="gradient-hero py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-5xl font-bold mb-4 text-white">
            {t("Merchant Not Found")}
          </h1>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-12">
        <Card className="p-12 rounded-2xl shadow-card text-center">
          <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">{t("Merchant Not Found")}</h2>
          <p className="text-muted-foreground mb-6">
            {t("The merchant you're looking for doesn't exist or you don't have access to it.")}
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