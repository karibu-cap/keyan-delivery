import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { checkIsAdmin } from "@/lib/actions/server/admin/admin-guard";
import Unauthorized from "./unauthorized";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    const { isAdmin, user } = await checkIsAdmin();

    if (!isAdmin) {
        return <Unauthorized />
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <AdminSidebar user={user || undefined} />

            <div className="flex flex-1 flex-col overflow-hidden ml-64 transition-all duration-300">
                <AdminHeader user={user || undefined} />

                <main className="flex-1 overflow-y-auto">
                    <div className="container mx-auto p-6">{children}</div>
                </main>
            </div>
        </div>
    );
}