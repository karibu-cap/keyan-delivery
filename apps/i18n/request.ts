import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';


export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested)
        ? requested
        : routing.defaultLocale;
    const messages = (await import(`../messages/${locale}.json`)).default;

    return {
        locale,
        messages,
        timeZone: 'Africa/Nairobi',
        now: new Date(),
        // Fallback for missing keys in development
        onError: (error) => {
            if (process.env.NODE_ENV === 'development') {
                console.error('[i18n] Translation error:', error.message);
            }
        },
        getMessageFallback: ({ namespace, key }) => {
            if (process.env.NODE_ENV === 'development') {
                return `[Missing: ${namespace}.${key}]`;
            }
            return `${namespace}.${key}`;
        },
    };
});