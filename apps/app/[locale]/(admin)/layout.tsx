
import "../../globals.css";


export default async function AdminLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {

    return <section className="admin-theme">{children}</section>;
}