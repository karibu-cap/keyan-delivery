import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/router";
import { getServerT } from "@/i18n/server-translations";

export default async function UnauthorizedPage() {
    const t = await getServerT();
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl">
                <div className="flex justify-center">
                    <div className="rounded-full bg-destructive/10 p-4">
                        <ShieldAlert className="h-12 w-12 text-destructive" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">
                        {t("Access Denied")}
                    </h1>
                    <p className="text-muted-foreground">
                        {t("You don't have permission to access this page. Only members of this merchant can access.")}
                    </p>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                    <Button asChild size="lg">
                        <Link href={ROUTES.home}>
                            {t("Return to Home")}
                        </Link>
                    </Button>
                </div>
            </Card>
        </div>
    );
}