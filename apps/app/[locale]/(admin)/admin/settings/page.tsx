import { Metadata } from "next";
import { getServerT } from "@/i18n/server-translations";
import { getSettings } from "@/lib/actions/server/admin/settings";
import SettingsClient from "@/components/admin/settings/SettingsClient";

export const metadata: Metadata = {
    title: "Settings | Admin Dashboard",
    description: "Configure platform settings and preferences",
};

export default async function SettingsPage() {
    const t = await getServerT();
    const settings = await getSettings();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t("Platform Settings")}</h1>
                <p className="text-muted-foreground">
                    {t("Configure platform behavior, features, and preferences")}
                </p>
            </div>

            <SettingsClient settings={settings} />
        </div>
    );
}