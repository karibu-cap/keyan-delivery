import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getServerT } from "@/i18n/server-translations";
import { Store, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function MerchantNotFound() {
    const t = await getServerT();
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full p-8 text-center space-y-6">
                <div className="flex justify-center">
                    <div className="rounded-full bg-muted p-4">
                        <Store className="h-12 w-12 text-muted-foreground" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">{t("Merchant Not Found")}</h1>
                    <p className="text-muted-foreground">
                        {t("The merchant you're looking for doesn't exist or has been removed.")}
                    </p>
                </div>

                <Button asChild>
                    <Link href="/admin/merchants">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t("Back to Merchants")}
                    </Link>
                </Button>
            </Card>
        </div>
    );
}