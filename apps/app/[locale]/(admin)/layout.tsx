import { checkIsAdmin } from "@/lib/actions/server/admin/admin-guard";
import { redirect } from "next/navigation";

export default async function AdminLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAdmin } = await checkIsAdmin();

    if (!isAdmin) {
        redirect("/unauthorized");
    }

    return <>{children}</>;
}