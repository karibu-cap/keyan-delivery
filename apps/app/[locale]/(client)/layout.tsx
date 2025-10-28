import Navbar from "@/components/Navbar";
import '../../globals.css';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return <>
        <Navbar />

        {children}
    </>;
}