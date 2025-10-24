// File: /components/driver/DriverNavbar.tsx
// Driver navigation bar with conditional menus based on driver status
// Theme: red-600 (#dc2626)

"use client";

import React, { useEffect, useState } from 'react';
import { BarChart3, Wallet, User, Menu, Truck, Package, FileText, Clock, LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/router';
import { useAuthStore } from '@/hooks/use-auth-store';
import { DriverStatus, UserRole } from '@prisma/client';

interface Item {
    name: string,
    icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>,
    path: string,
    mobileLabel: string
}

// Navigation items for APPROVED drivers
const approvedNavItems = [
    {
        name: 'Dashboard',
        icon: Package,
        path: ROUTES.driverDashboard,
        mobileLabel: 'Orders'
    },
    {
        name: 'Insights',
        icon: BarChart3,
        path: ROUTES.driverInsights,
        mobileLabel: 'Insights'
    },
    {
        name: 'Wallet',
        icon: Wallet,
        path: ROUTES.driverWallet,
        mobileLabel: 'Wallet'
    },
    {
        name: 'Profile',
        icon: User,
        path: ROUTES.driverProfile,
        mobileLabel: 'Profile'
    },
];

// Navigation items for NON-APPROVED drivers
const pendingNavItems = [
    {
        name: 'Customers',
        icon: User,
        path: ROUTES.home,
        mobileLabel: 'Customers'
    },
    {
        name: 'Review Status',
        icon: Clock,
        path: '/driver/review',
        mobileLabel: 'Review'
    },
];


// Navigation items for user that will becomme drivers
const userNavItems = [
    {
        name: 'Customers',
        icon: User,
        path: ROUTES.home,
        mobileLabel: 'Customers'
    },
    {
        name: 'Apply',
        icon: FileText,
        path: '/driver/apply',
        mobileLabel: 'Apply'
    },
];

export default function DriverNavbar() {
    const [isOpen, setIsOpen] = React.useState(false);
    const pathname = usePathname();
    const { user, refreshSession } = useAuthStore();
    const [navItems, setNavItems] = useState<Item[]>(approvedNavItems);

    // Update nav items based on driver status
    useEffect(() => {
        const load = async () => {
            await refreshSession()
        }
        load()
    }, [user?.driverStatus]);

    // Update nav items based on driver status
    useEffect(() => {
        if (!user?.roles?.includes(UserRole.driver)) {
            setNavItems(userNavItems);
        } else if (user?.roles?.includes(UserRole.driver) && user?.driverStatus === DriverStatus.APPROVED) {
            setNavItems(approvedNavItems);
        } else {
            setNavItems(pendingNavItems);
        }
    }, [user?.driverStatus]);

    const isActiveRoute = (path: string) => {
        // Remove the locale in url
        const result = pathname.slice(3)
        if (path == '/') {
            return result == path; 
        }
        return result.startsWith(path);
    };

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/driver/dashboard" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                                <Truck className="w-6 h-6 text-white" />
                            </div>
                            <div className="hidden sm:flex flex-col">
                                <span className="text-xl font-bold text-red-600">
                                    Yetu
                                </span>
                                <span className="text-xs text-muted-foreground -mt-1">
                                    Driver
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Nav Items */}
                        <div className="flex items-center gap-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = isActiveRoute(item.path);

                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200",
                                            "hover:bg-red-50 hover:text-red-600 hover:scale-105 dark:hover:bg-red-950/20",
                                            isActive && "bg-red-600 text-white font-medium shadow-md scale-105"
                                        )}
                                    >
                                        <Icon className={cn(
                                            "w-5 h-5 transition-transform duration-200",
                                            isActive && "scale-110"
                                        )} />
                                        <span className="hidden lg:block">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
                <div className="flex items-center justify-between h-14 px-4">
                    <Link href="/driver/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                            <Truck className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm">Yetu</span>
                            <span className="text-xs text-muted-foreground -mt-0.5">Driver</span>
                        </div>
                    </Link>

                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-64">
                            
                            <SheetTitle><Link href="/driver/dashboard" className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                                    <Truck className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-sm">Yetu</span>
                                    <span className="text-xs text-muted-foreground -mt-0.5">Driver</span>
                                </div>
                            </Link></SheetTitle>
                            
                            <div className="flex flex-col gap-2 mt-8">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = isActiveRoute(item.path);

                                    return (
                                        <Link
                                            key={item.path}
                                            href={item.path}
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200",
                                                "hover:bg-red-50 hover:text-red-600 hover:scale-105 dark:hover:bg-red-950/20",
                                                isActive && "bg-red-600 text-white font-medium shadow-md scale-105"
                                            )}
                                        >
                                            <Icon className={cn(
                                                "w-5 h-5 transition-transform duration-200",
                                                isActive && "scale-110"
                                            )} />
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </header>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-bottom">
                <div className="flex items-center justify-around h-16 px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isActiveRoute(item.path);

                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={cn(
                                    "relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 flex-1",
                                    "hover:bg-red-50 dark:hover:bg-red-950/20",
                                    isActive && "text-red-600"
                                )}
                            >
                                {/* Active indicator - red line at bottom */}
                                {isActive && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-red-600 rounded-t-full" />
                                )}
                                <Icon className={cn(
                                    "w-5 h-5 transition-transform duration-200",
                                    isActive && "scale-110"
                                )} />
                                <span className={cn(
                                    "text-xs transition-all duration-200",
                                    isActive ? "font-medium text-red-600" : "text-muted-foreground"
                                )}>
                                    {item.mobileLabel}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}