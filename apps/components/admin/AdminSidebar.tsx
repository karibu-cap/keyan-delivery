"use client";

import Link from "next/link";




import { useState } from "react";
import { useT } from "@/hooks/use-inline-translation";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import ExitAdminModeDialog from "./ExitAdminModeDialog";
import { AdminNavMain } from "./AdminNavMain";
import { AdminNavUser } from "./AdminNavUser";
import { Separator } from "../ui/separator";
import Image from "next/image";

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const t = useT();
    const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5 grayscale"
                        >
                            <Link href="/admin/dashboard">
                                <Image src={"/icons/ios/256.png"} alt="logo" width={30} height={30} />
                                <span className="text-lg font-semibold">Pataupesi {t('Admin Panel')}</span>
                            </Link>
                        </SidebarMenuButton>

                    </SidebarMenuItem>
                </SidebarMenu>
                <Separator />
            </SidebarHeader>
            <SidebarContent>
                <AdminNavMain />
            </SidebarContent>
            <Separator />
            <SidebarFooter>
                <AdminNavUser onSwitchToCustomerMode={() => setIsExitDialogOpen(true)} />
            </SidebarFooter>
            <ExitAdminModeDialog
                isOpen={isExitDialogOpen}
                onClose={() => setIsExitDialogOpen(false)}
            />
        </Sidebar>
    )

}