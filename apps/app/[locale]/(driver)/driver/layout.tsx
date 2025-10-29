"use client";
import DriverNavbar from '@/components/driver/DriverNavbar';
import "../../../globals.css"
import { QueryProvider } from '@/lib/providers/query-provider';

export default function DriverLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (

        <QueryProvider>
            <div className='driver-theme'>
                <DriverNavbar />
                <div className="mt-14 mb-16 md:mt-16 min-h-screen">
                    {children}
                </div>
            </div>
        </QueryProvider>
    );
}
