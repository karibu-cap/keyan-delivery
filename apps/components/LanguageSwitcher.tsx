'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';
import { useTransition } from 'react';

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const switchLocale = (newLocale: Locale) => {
        startTransition(() => {
            // Remove current locale from pathname and add new one
            const segments = pathname.split('/');
            segments[1] = newLocale;
            const newPath = segments.join('/');
            router.replace(newPath);
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isPending} className='p-4'>
                    <span>{localeFlags[locale as Locale]}</span>
                    <Globe className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {locales.map((loc) => (
                    <DropdownMenuItem
                        key={loc}
                        onClick={() => switchLocale(loc)}
                        className={locale === loc ? 'bg-accent' : ''}
                    >
                        <span className="mr-2">{localeFlags[loc]}</span>
                        {localeNames[loc]}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}