import { Button } from "@/components/ui/button";
import { getServerT } from "@/i18n/server-translations";
import { ROUTES } from "@/lib/router";
import { ArrowLeft, Store } from "lucide-react";

import Link from "next/link";

export default async function NotFound() {
    const t = await getServerT()
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto max-w-7xl px-4 py-20">
                <div className="text-center">
                    <Store className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {t("Store Not Found")}
                    </h1>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        {t("The store you're looking for doesn't exist or is currently unavailable.")}
                    </p>
                    <Link href={ROUTES.stores}>
                        <Button className="bg-primary hover:bg-primary">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t("Back to Stores")}
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
