"use client";

import React from 'react';
import { Package, BarChart3, Wallet, User, Menu, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/router';

// Navigation items configuration
const navItems = [
    {
        name: 'Products',
        icon: Package,
        path: '/products',
        mobileLabel: 'Products'
    },
    {
        name: 'Insights',
        icon: BarChart3,
        path: '/insights',
        mobileLabel: 'Insights'
    },
    {
        name: 'Wallet',
        icon: Wallet,
        path: '/wallet',
        mobileLabel: 'Wallet'
    },
    {
        name: 'Profile',
        icon: User,
        path: '/profile',
        mobileLabel: 'Profile'
    },
];

export default function MerchantNavBar() {
    const [isOpen, setIsOpen] = React.useState(false);
    const params = useParams();
    const pathname = usePathname();
    const merchantId = params.merchantId as string;

    const isActiveRoute = (path: string) => {
        const basePath = `/merchant/${merchantId}`;
        const fullPath = `${basePath}${path}`;

        if (path === '') {
            return pathname === basePath || pathname === `${basePath}/dashboard`;
        }

        return pathname.startsWith(fullPath);
    };

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href={`/merchant/${merchantId}`} className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                                <Store className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-primary hidden sm:block">
                                Yetu Store
                            </span>
                        </Link>

                        {/* Desktop Nav Items */}
                        <div className="flex items-center gap-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = isActiveRoute(item.path);
                                const href = `/merchant/${merchantId}${item.path}`;

                                return (
                                    <Link
                                        key={item.path}
                                        href={href}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200",
                                            "hover:bg-accent hover:text-accent-foreground",
                                            isActive && "bg-accent text-accent-foreground font-medium"
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
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
                    <Link href={ROUTES.home} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-sm">MP</span>
                        </div>
                        <span className="font-semibold">MarketPlace</span>
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
                                    const href = `/merchant/${merchantId}${item.path}`;

                                    return (
                                        <Link
                                            key={item.path}
                                            href={href}
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200",
                                                "hover:bg-accent hover:text-accent-foreground",
                                                isActive && "bg-accent text-accent-foreground font-medium"
                                            )}
                                        >
                                            <Icon className="w-5 h-5" />
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
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
                <div className="flex items-center justify-around h-16 px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isActiveRoute(item.path);
                        const href = `/merchant/${merchantId}${item.path}`;

                        return (
                            <Link
                                key={item.path}
                                href={href}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 flex-1",
                                    "hover:bg-accent/50",
                                    isActive && "text-primary"
                                )}
                            >
                                <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
                                <span className={cn(
                                    "text-xs transition-all",
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