// File: /components/driver/DriverNavbar.tsx
// Driver navigation bar with desktop horizontal nav and mobile bottom nav
// Theme: red-600 (#dc2626)

"use client";

import React from 'react';
import { BarChart3, Wallet, User, Menu, Truck, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/router';

// Navigation items configuration for driver
const navItems = [
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

export default function DriverNavbar() {
    const [isOpen, setIsOpen] = React.useState(false);
    const pathname = usePathname();

    const isActiveRoute = (path: string) => {
        // Check if current pathname starts with the nav item path
        // This handles sub-routes like /driver/wallet/withdrawal
        if (path === ROUTES.driverDashboard) {
            return pathname === path || pathname === '/driver';
        }

        return pathname.startsWith(path);
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
                                {/* Active indicator - red line at top */}
                                {isActive && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-red-600 rounded-b-full" />
                                )}
                                <Icon className={cn(
                                    "w-5 h-5 transition-transform duration-200",
                                    isActive && "scale-110"
                                )} />
                                <span className={cn(
                                    "text-xs transition-all duration-200",
                                    isActive ? "font-medium" : "text-muted-foreground"
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
