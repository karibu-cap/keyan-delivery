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
import { locales, localeShortNames, type Locale } from '@/i18n/config';
import { useTransition } from 'react';
import { ChevronDown } from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: Locale) => {
    startTransition(() => {
      const segments = pathname.split('/');
      segments[1] = newLocale;
      const newPath = segments.join('/');
      router.replace(newPath);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          className="
            px-3 h-8 text-xs font-medium
            border rounded-md 
            flex items-center gap-1
          "
        >
          {locale.toUpperCase()}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="text-sm">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLocale(loc)}
            className={`
              ${locale === loc ? 'bg-accent font-semibold' : ''}
            `}
          >
            {localeShortNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
