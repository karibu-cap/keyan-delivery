"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { LogOut, ShoppingBag } from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';
import Link from 'next/link';
import { ROUTES } from '@/lib/router';

interface ExitMerchantModeDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ExitMerchantModeDialog({ isOpen, onClose }: ExitMerchantModeDialogProps) {
    const t = useT();

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                            <LogOut className="w-6 h-6 text-destructive" />
                        </div>
                        <AlertDialogTitle className="text-xl">
                            {t('Exit Merchant Mode?')}
                        </AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-base space-y-2">
                        {t('You are about to switch back to customer mode. You will be able to:')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>{t('Browse and shop from stores')}</li>
                    <li>{t('View your orders and cart')}</li>
                    <li>{t('Manage your customer profile')}</li>
                </ul>
                <p className="mt-3">
                    {t('You can return to merchant mode anytime from your profile')}
                </p>
                <AlertDialogFooter className="gap-2 sm:gap-0">
                    <AlertDialogCancel onClick={onClose}>
                        {t('Cancel')}
                    </AlertDialogCancel>
                    <span className='w-2' />
                    <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/90"
                        asChild
                    >
                        <Link href={ROUTES.home} className='flex flex-row'>
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            {t('Switch to Customer Mode')}
                        </Link>

                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}