import { checkIsAdmin } from "@/lib/actions/server/admin/admin-guard";
import Unauthorized from "./unauthorized";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    const { isAdmin } = await checkIsAdmin();

    if (!isAdmin) {
        return <Unauthorized />
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background">

            <AdminCustomSideBar>{children}</AdminCustomSideBar>

        </div>
    );
}


const AdminCustomSideBar = ({
    children,
}: Readonly<{
    children: React.ReactNode
}>) => {
    return (
        <SidebarProvider style={
            {
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
        }>
            <AdminSidebar variant="inset" />
            <SidebarInset>
                <AdminHeader />
                <div className="flex flex-1 flex-col p-4 overflow-y-auto">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            {children}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}