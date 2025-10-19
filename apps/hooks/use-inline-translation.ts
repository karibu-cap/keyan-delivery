'use client';

import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';

/**
 * Inline Translation Hook - Write translations directly in code!
 * 
 * @example
 * const t = useInlineTranslation();
 * 
 * // Simple text
 * <h1>{t('Welcome to Yetu')}</h1>
 * 
 * // With variables
 * <p>{t('Hello {name}', { name: 'John' })}</p>
 * 
 * // With amount
 * <div>{t('Total: {amount}', { amount: 100 })}</div>
 * 
 * // Rich text
 * <p>{t.rich('Click <link>here</link>', {
 *   link: (chunks) => <a href="/link">{chunks}</a>
 * })}</p>
 */

// Helper: Generate key from text
function generateKey(text: string): string {
    return text
        .toLowerCase()
        // Remove template markers
        .replace(/[{}\[\]<>]/g, '')
        // Replace non-alphanumeric with dash
        .replace(/[^a-z0-9]+/g, '-')
        // Remove leading/trailing dashes
        .replace(/^-+|-+$/g, '')
        // Limit length
        .substring(0, 100);
}

// Track missing translations in development
function trackMissing(text: string, key: string) {
    if (process.env.NODE_ENV === 'development') {
        // Store in sessionStorage for extraction tool
        try {
            const missing = JSON.parse(
                sessionStorage.getItem('i18n-missing') || '[]'
            );

            if (!missing.find((m: unknown) => (m as { key: string }).key === key)) {
                missing.push({
                    key,
                    text,
                    timestamp: Date.now(),
                });
                sessionStorage.setItem('i18n-missing', JSON.stringify(missing));
            }
        } catch (e) {
            // Silent fail
        }

        console.warn(`[i18n] Missing translation: "${text}" (key: ${key})`);
    }
}

export function useInlineTranslation(namespace?: string) {
    const tBase = useTranslations(namespace);

    /**
     * Main translation function with auto-key generation
     */
    function t(text: string, values?: Record<string, unknown>): string {
        const key = generateKey(text);

        try {
            // Try to get translation using generated key
            const translated = tBase(key as string, values as Record<string, string | number | Date>);
            return translated;
        } catch (error) {
            // Track missing translation
            trackMissing(text, key);

            // Fallback: Simple template replacement for development
            if (values) {
                return text.replace(/\{(\w+)\}/g, (_, varKey) => {
                    const value = values[varKey];
                    return value !== undefined ? String(value) : `{${varKey}}`;
                });
            }

            return text;
        }
    }

    /**
     * Rich text translation with React components
     */
    function rich(
        text: string,
        values?: Record<string, (chunks: ReactNode) => ReactNode>
    ): ReactNode {
        const key = generateKey(text);

        try {
            return tBase.rich(key as string, values as Record<string, (chunks: ReactNode) => ReactNode>);
        } catch (error) {
            trackMissing(text, key);

            // Fallback: Return plain text
            return text;
        }
    }

    /**
     * Plural translation
     */
    function plural(
        text: string,
        count: number,
        values?: Record<string, unknown>
    ): string {
        const key = generateKey(text);

        try {
            return tBase(key as string, { ...values, count });
        } catch (error) {
            trackMissing(text, key);

            // Simple plural fallback
            if (count === 0) return text.replace('{count}', '0');
            if (count === 1) return text.replace('{count}', '1').replace(/s$/, '');
            return text.replace('{count}', String(count));
        }
    }

    // Return t function with additional methods
    return Object.assign(t, {
        rich,
        plural,
    });
}

/**
 * Shorter alias for useInlineTranslation
 */
export function useT(namespace?: string) {
    return useInlineTranslation(namespace);
}
