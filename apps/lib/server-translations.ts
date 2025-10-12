/** 
 * 
 * Server-side inline translation helper
 * 
 * Usage in Server Components:
 * 
 * const t = await getT();
 * <h1>{t('Welcome to Keyan')}</h1>
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
 * @param locale - Optional locale override
 * @param namespace - Optional namespace for grouping
 * @returns Translation function
 */
export async function getT(locale: string, namespace?: string) {
    const { getTranslations } = await import('next-intl/server');
    const t = await getTranslations({ locale: locale, namespace });

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
 * @param locale - Optional locale override
 * @param namespace - Optional namespace for grouping
 * @returns Translation function
 */
export async function getTRich(locale: string, namespace?: string) {
    const { getTranslations } = await import('next-intl/server');
    const t = await getTranslations({ locale: locale, namespace });

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


/**
 * Convenience function that returns both t and t.rich
 */
export async function getServerT(locale: string, namespace?: string) {
    const t = await getT(locale, namespace);
    const rich = await getTRich(locale, namespace);

    return Object.assign(t, { rich });
}