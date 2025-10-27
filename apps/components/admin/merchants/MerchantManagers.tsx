import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getServerT } from "@/i18n/server-translations";
import { User, Mail, Phone, Calendar } from "lucide-react";

interface Manager {
    user: {
        name: string | null;
        email: string;
        phone: string | null;
        image: string | null;
    };
    assignedAt: Date;
}

interface MerchantManagersProps {
    managers: Manager[];
}

export async function MerchantManagers({ managers }: MerchantManagersProps) {
    const t = await getServerT();
    if (managers.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <User className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">{t("No managers assigned")}</p>
                    <p className="text-sm text-muted-foreground">
                        {t("This merchant doesn't have any managers yet")}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {managers.map((manager, index) => (
                <Card key={index}>
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <Avatar className="flex h-12 w-12 flex-shrink-0">
                                <AvatarImage src={manager.user.image || undefined} alt="@manager" />
                                <AvatarFallback className="flex items-center justify-center bg-primary text-primary-foreground text-lg font-bold"> {manager.user.name?.[0]?.toUpperCase() ||
                                    manager.user.email[0].toUpperCase()} </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <h3 className="font-semibold">
                                    {manager.user.name || t("Unnamed Manager")}
                                </h3>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-3 w-3" />
                                        {manager.user.email}
                                    </div>
                                    {manager.user.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-3 w-3" />
                                            {manager.user.phone}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3 w-3" />
                                        {t("Assigned")} {t.formatDateTime(manager.assignedAt)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}