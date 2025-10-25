import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getZoneById } from "@/lib/actions/server/admin/zones";
import { getServerT } from "@/i18n/server-translations";
import EditZoneForm from "@/components/admin/zones/EditZoneForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Edit Zone | Admin Dashboard",
    description: "Edit delivery zone details and landmarks",
};

interface EditZonePageProps {
    params: {
        id: string;
    };
}

export default async function EditZonePage({ params }: EditZonePageProps) {
    const t = await getServerT();
    const zone = await getZoneById(params.id);

    if (!zone) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/zones">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t("Edit Zone")}: {zone.name}
                    </h1>
                    <p className="text-muted-foreground">{t("Update zone details, boundaries, and landmarks")}</p>
                </div>
            </div>

            <EditZoneForm zone={zone} />
        </div>
    );
}