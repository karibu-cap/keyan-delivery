"use client"


import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useT } from "@/hooks/use-inline-translation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Store, Package, UserIcon, Users, MapPin, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
    id: string;
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
}
export function AdminNavMain() {

    const t = useT();
    const pathname = usePathname();

    const navItems: NavItem[] = [
        {
            id: "dashboard",
            title: t("Dashboard"),
            href: "/admin/dashboard",
            icon: LayoutDashboard,
        },
        {
            id: "merchants",
            title: t("Merchants"),
            href: "/admin/merchants",
            icon: Store,
        },
        {
            id: "products",
            title: t("Products"),
            href: "/admin/products",
            icon: Package,
        },
        {
            id: "drivers",
            title: t("Drivers"),
            href: "/admin/drivers",
            icon: UserIcon,
        },
        {
            id: "users",
            title: t("Users"),
            href: "/admin/users",
            icon: Users,
        },
        {
            id: "zones",
            title: t("Delivery Zones"),
            href: "/admin/zones",
            icon: MapPin,
        },
        {
            id: "insights",
            title: t("Insights"),
            href: "/admin/insights",
            icon: TrendingUp,
        },
    ];

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {navItems.map((item) => (
                        <SidebarMenuItem key={item.title} className="flex items-center gap-2">
                            <SidebarMenuButton tooltip={item.title} asChild className={cn(
                                "",
                                pathname.split('/').includes(item.id.toLowerCase()) && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear")}
                            >
                                <Link href={item.href} >
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup >
    )
}
