import EditZoneForm from "@/components/admin/zones/EditZoneForm";
import { Button } from "@/components/ui/button";
import { getServerT } from "@/i18n/server-translations";
import { getZoneById } from "@/lib/actions/server/admin/zones";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Edit Zone | Admin Dashboard",
    description: "Edit delivery zone details and landmarks",
};

interface EditZonePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditZonePage({ params }: EditZonePageProps) {
    const t = await getServerT();
    const props = await params
    const zone = await getZoneById(props.id);

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