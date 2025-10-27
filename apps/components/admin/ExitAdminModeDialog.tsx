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
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/router';

interface ExitAdminModeDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ExitAdminModeDialog({ isOpen, onClose }: ExitAdminModeDialogProps) {
    const t = useT();
    const router = useRouter();

    const handleConfirmExit = () => {
        router.push(ROUTES.profile);
        onClose();
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                            <LogOut className="w-6 h-6 text-destructive" />
                        </div>
                        <AlertDialogTitle className="text-xl">
                            {t('Exit Admin Mode?')}
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
                    {t('You can return to admin mode anytime')}
                </p>
                <AlertDialogFooter className='flex flex-row gap-2 sm:gap-0'>
                    <AlertDialogCancel onClick={onClose}>
                        {t('Cancel')}
                    </AlertDialogCancel>
                    <div className="w-2" />
                    <AlertDialogAction

                        onClick={handleConfirmExit}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        <ShoppingBag className="w-4 h-4 mr-2 ml-2" />
                        {t('Switch to Customer Mode')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}