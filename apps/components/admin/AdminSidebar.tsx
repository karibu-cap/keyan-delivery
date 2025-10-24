"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Store,
    Package,
    Users,
    MapPin,
    TrendingUp,
    Bell,
    Settings,
    ChevronRight,
    User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { useT } from "@/hooks/use-inline-translation";

interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
}


interface AdminSidebarProps {
    user?: {
        name?: string | null;
        email: string;
    };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const t = useT();


    const navItems: NavItem[] = [
        {
            title: t("Dashboard"),
            href: "/admin",
            icon: LayoutDashboard,
        },
        {
            title: t("Merchants"),
            href: "/admin/merchants",
            icon: Store,
        },
        {
            title: t("Products"),
            href: "/admin/products",
            icon: Package,
        },
        {
            title: t("Drivers"),
            href: "/admin/drivers",
            icon: UserIcon,
        },
        {
            title: t("Users"),
            href: "/admin/users",
            icon: Users,
        },
        {
            title: t("Delivery Zones"),
            href: "/admin/zones",
            icon: MapPin,
        },
        {
            title: t("Insights"),
            href: "/admin/insights",
            icon: TrendingUp,
        },
        {
            title: t("Notifications"),
            href: "/admin/notifications",
            icon: Bell,
        },
        {
            title: t("Settings"),
            href: "/admin/settings",
            icon: Settings,
        },
    ];

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen border-r bg-sidebar transition-all duration-300",
                    collapsed ? "w-16" : "w-64"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center justify-between border-b px-4">
                        {!collapsed && (
                            <Link href="/admin" className="flex items-center space-x-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <LayoutDashboard className="h-5 w-5" />
                                </div>
                                <span className="text-lg font-bold">Admin Panel</span>
                            </Link>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCollapsed(!collapsed)}
                            className={cn("h-8 w-8", collapsed && "mx-auto")}
                        >
                            <ChevronRight
                                className={cn(
                                    "h-4 w-4 transition-transform",
                                    !collapsed && "rotate-180"
                                )}
                            />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 overflow-y-auto p-2">
                        {navItems.map((item) => {
                            const isActive =
                                pathname === item.href ||
                                (item.href !== "/admin" && pathname.startsWith(item.href));
                            const Icon = item.icon;

                            const content = (
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                        collapsed && "justify-center px-2"
                                    )}
                                >
                                    <Icon className="h-5 w-5 flex-shrink-0" />
                                    {!collapsed && (
                                        <>
                                            <span className="flex-1">{item.title}</span>
                                            {item.badge && (
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </Link>
                            );

                            if (collapsed) {
                                return (
                                    <Tooltip key={item.href}>
                                        <TooltipTrigger asChild>{content}</TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p>{item.title}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            }

                            return <div key={item.href}>{content}</div>;
                        })}
                    </nav>

                    {/* User Info */}
                    {user && (
                        <div className="border-t p-4">
                            {!collapsed ? (
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                                        {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="truncate text-sm font-medium">
                                            {user.name || "Admin"}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold mx-auto">
                                            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        <p>{user.name || user.email}</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    )}
                </div>
            </aside>
        </TooltipProvider>
    );
}