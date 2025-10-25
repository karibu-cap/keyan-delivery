"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useT } from "@/hooks/use-inline-translation";
import { ROUTES } from "@/lib/router";
import { Bell, LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface AdminHeaderProps {
    title?: string;
    description?: string;
    user?: {
        name?: string | null;
        email: string;
        image?: string | null;
    };
}

export function AdminHeader({ title, description, user }: AdminHeaderProps) {
    const router = useRouter();
    const { logout } = useAuthStore();
    const t = useT();

    const handleLogout = async () => {
        await logout();
        router.push(ROUTES.home);
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
            <div className="flex flex-1 items-center justify-between">
                {/* Page Title */}
                <div>
                    {title && (
                        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
                    )}
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="h-5 w-5" />
                                <Badge
                                    variant="destructive"
                                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                                >
                                    3
                                </Badge>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel>{t("Notifications")}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="max-h-96 overflow-y-auto">
                                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                                    <div className="flex w-full items-start justify-between">
                                        <p className="text-sm font-medium">{t("New merchant pending")}</p>
                                        <span className="text-xs text-muted-foreground">2m ago</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {t("Fresh Market Store is waiting for approval")}
                                    </p>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                                    <div className="flex w-full items-start justify-between">
                                        <p className="text-sm font-medium">{t("Driver verification")}</p>
                                        <span className="text-xs text-muted-foreground">1h ago</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {t("John Doe submitted documents for review")}
                                    </p>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                                    <div className="flex w-full items-start justify-between">
                                        <p className="text-sm font-medium">{t("Product pending approval")}</p>
                                        <span className="text-xs text-muted-foreground">3h ago</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {t("5 new products waiting for review")}
                                    </p>
                                </DropdownMenuItem>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="gap-2">
                                <Avatar className="flex h-8 w-8 flex-shrink-0">
                                    <AvatarImage src={user?.image || undefined} alt="@manager" />
                                    <AvatarFallback className="flex items-center justify-center bg-primary text-primary-foreground text-lg font-bold"> {user?.name?.[0]?.toUpperCase() || user?.email[0].toUpperCase() || "A"} </AvatarFallback>
                                </Avatar>
                                <div className="hidden text-left md:block">
                                    <p className="text-sm font-medium">
                                        {user?.name || "Admin"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{t("Administrator")}</p>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>{t("My Account")}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push(ROUTES.profile)}>
                                <User className="mr-2 h-4 w-4" />
                                {t("Profile")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
                                <Settings className="mr-2 h-4 w-4" />
                                {t("Settings")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                                <LogOut className="mr-2 h-4 w-4" />
                                {t("Logout")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}