"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useT } from "@/hooks/use-inline-translation";

/**
 * Error boundary for products page
 */
export default function ProductsError({
     error,
     reset,
}: {
     error: Error & { digest?: string };
     reset: () => void;
}) {
     const t = useT()
     useEffect(() => {
          console.error('Products Page Error:', error);
     }, [error]);

     return (
          <div className="min-h-screen bg-background">
               <Navbar />

               <section className="gradient-hero py-16 px-4">
                    <div className="container mx-auto max-w-7xl">
                         <h1 className="text-5xl font-bold mb-4 text-white">
                              {t("Product Management")}
                         </h1>
                    </div>
               </section>

               <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-12">
                    <Card className="p-12 rounded-2xl shadow-card text-center">
                         <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
                         <h2 className="text-2xl font-bold mb-2">{t("Failed to Load Products")}</h2>
                         <p className="text-muted-foreground mb-6">
                              {t("We encountered an error while loading your products.")}
                         </p>
                         <div className="flex gap-4 justify-center">
                              <Button onClick={reset}>
                                   {t("Try Again")}
                              </Button>
                              <Button
                                   variant="outline"
                                   onClick={() => window.history.back()}
                              >
                                   {t("Go Back")}
                              </Button>
                         </div>
                    </Card>
               </div>
          </div>
     );
}