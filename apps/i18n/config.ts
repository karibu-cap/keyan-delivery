export type Locale = 'en' | 'sw';

export const locales: Locale[] = ['en', 'sw'];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
    en: 'English',
    sw: 'Kiswahili',
};

export const localeFlags: Record<Locale, string> = {
    en: '🇬🇧',
    sw: '🇹🇿',
};

// Currency settings per locale
export const localeCurrency: Record<Locale, { code: string; symbol: string }> = {
    en: { code: 'USD', symbol: '$' },
    sw: { code: 'TZS', symbol: 'TSh' },
};

// Date format per locale
export const localeDateFormat: Record<Locale, string> = {
    en: 'MM/DD/YYYY',
    sw: 'DD/MM/YYYY',
};