/** 
 * 
 * Server-side inline translation helper
 * 
 * Usage in Server Components:
 * 
 * const t = await getServerT();
 * <h1>{t('Welcome to Pataupesi')}</h1>
 */

// Helper: Generate key from text (same as client-side)
function generateKey(text: string): string {
    return text
        .toLowerCase()
        .replace(/[{}\[\]<>]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100);
}


/**
 * Get inline translation function for server components
 * 
 * @param namespace - Optional namespace for grouping
 * @returns Translation function
 */
export async function getT() {
    const { getTranslations, getLocale } = await import('next-intl/server');
    const locale = await getLocale();
    const t = await getTranslations({ locale: locale });

    return (text: string, values?: Record<string, unknown>) => {
        const key = generateKey(text);
        try {
            return t(key as string, values as Record<string, string | number | Date>);
        } catch (error) {
            // In development, log missing translations
            if (process.env.NODE_ENV === 'development') {
                console.warn(`[i18n Server] Missing translation: "${text}" (key: ${key})`);
            }

            // Fallback: Simple template replacement
            if (values) {
                return text.replace(/\{(\w+)\}/g, (_, varKey) => {
                    const value = values[varKey];
                    return value !== undefined ? String(value) : `{${varKey}}`;
                });
            }

            return text;
        }
    };
}

/**
 * Get inline translation function for server components
 * 
 * @param namespace - Optional namespace for grouping
 * @returns Translation function
 */
export async function getTRich() {
    const { getTranslations, getLocale } = await import('next-intl/server');
    const locale = await getLocale();
    const t = await getTranslations({ locale: locale });

    return (text: string, values?: Record<string, unknown>) => {
        const key = generateKey(text);
        try {
            return t.rich(key as string, values as Record<string, string | number | Date>);
        } catch (_) {
            // In development, log missing translations
            if (process.env.NODE_ENV === 'development') {
                console.warn(`[i18n Server] Missing translation: "${text}" (key: ${key})`);
            }

            // Fallback: Simple template replacement
            if (values) {
                return text.replace(/\{(\w+)\}/g, (_, varKey) => {
                    const value = values[varKey];
                    return value !== undefined ? String(value) : `{${varKey}}`;
                });
            }

            return text;
        }
    };
}

export async function getFormatter() {
    const { getFormatter, getLocale } = await import('next-intl/server');
    const locale = await getLocale();
    const formatter = await getFormatter({ locale: locale });

    return (amount: number) => formatter.number(amount, { style: 'currency', currency: 'KES' });
}

export async function getFormatterDateTime() {
    const { getFormatter, getLocale } = await import('next-intl/server');
    const locale = await getLocale();
    const formatter = await getFormatter({ locale: locale });

    return (date: Date, displayTime: boolean = false) => formatter.dateTime(date, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: displayTime ? 'numeric' : undefined,
        minute: displayTime ? 'numeric' : undefined,
    });
}


/**
 * Convenience function that returns both t and t.rich
 */
export async function getServerT() {
    const t = await getT();
    const rich = await getTRich();
    const formatAmount = await getFormatter();
    const formatDateTime = await getFormatterDateTime();

    return Object.assign(t, { rich, formatAmount, formatDateTime });
}