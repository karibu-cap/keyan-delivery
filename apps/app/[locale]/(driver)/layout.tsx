"use client";

import DriverNavbar from "@/components/DriverNavbar";

export default function DriverLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return <>
        <DriverNavbar />
        {children}
    </>;
}