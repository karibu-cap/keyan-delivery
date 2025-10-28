"use client";
import DriverNavbar from '@/components/driver/DriverNavbar';
import "../../../globals.css"

export default function DriverLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <div className='driver-theme'>
            <DriverNavbar />
            <div className="mt-14 md:mt-16 min-h-screen">
                {children}
            </div>
        </div>
    );
}
