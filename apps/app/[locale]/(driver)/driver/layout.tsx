"use client";
import "./globals.css";

import DriverNavbar from '@/components/driver/DriverNavbar';

export default function DriverLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <>
            <DriverNavbar />
            <div className="mt-14 md:mt-16 min-h-screen">
                {children}
            </div>
        </>
    );
}
