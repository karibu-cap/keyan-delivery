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
import { useT } from "@/hooks/use-inline-translation";
import { Bell } from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";
import { Separator } from "../ui/separator";



export function AdminHeader() {
    const t = useT();

    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <div className="ml-auto flex items-center gap-2">
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
                </div>
            </div>
        </header>
    );
}