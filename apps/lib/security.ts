// Comprehensive security utilities and middleware
import DOMPurify from 'isomorphic-dompurify';

// Input sanitization
export class InputSanitizer {
    // Sanitize HTML content
    static sanitizeHTML(input: string): string {
        return DOMPurify.sanitize(input, {
            ALLOWED_TAGS: [], // No HTML tags allowed by default
            ALLOWED_ATTR: [],
        });
    }

    // Sanitize text input
    static sanitizeText(input: string): string {
        return input
            .trim()
            .replace(/[<>]/g, '') // Remove potential HTML characters
            .slice(0, 1000); // Limit length
    }

    // Sanitize email
    static sanitizeEmail(input: string): string {
        const email = input.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }

        return email;
    }

    // Sanitize phone number
    static sanitizePhone(input: string): string {
        const phone = input.replace(/[^\d+]/g, ''); // Keep only digits and +

        if (phone.length < 10 || phone.length > 15) {
            throw new Error('Invalid phone number length');
        }

        return phone;
    }

    // Sanitize URL
    static sanitizeURL(input: string): string {
        try {
            const url = new URL(input);

            // Only allow HTTP/HTTPS
            if (!['http:', 'https:'].includes(url.protocol)) {
                throw new Error('Invalid URL protocol');
            }

            return url.toString();
        } catch {
            throw new Error('Invalid URL format');
        }
    }

    // Sanitize file upload (filename)
    static sanitizeFilename(input: string): string {
        return input
            .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special characters with underscore
            .replace(/_{2,}/g, '_') // Replace multiple underscores with single
            .slice(0, 100); // Limit length
    }

    // Validate and sanitize search query
    static sanitizeSearchQuery(input: string): string {
        return input
            .trim()
            .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
            .slice(0, 200); // Limit search query length
    }
}

// Input validation schemas
export const VALIDATION_SCHEMAS = {
    // User registration
    USER_REGISTRATION: {
        email: (value: string) => InputSanitizer.sanitizeEmail(value),
        phone: (value: string) => InputSanitizer.sanitizePhone(value),
        name: (value: string) => InputSanitizer.sanitizeText(value),
    },

    // Product creation
    PRODUCT_CREATION: {
        title: (value: string) => InputSanitizer.sanitizeText(value),
        description: (value: string) => InputSanitizer.sanitizeHTML(value),
        price: (value: number) => {
            if (value < 0 || value > 10000) {
                throw new Error('Invalid price range');
            }
            return value;
        },
    },

    // Search query
    SEARCH_QUERY: {
        query: (value: string) => InputSanitizer.sanitizeSearchQuery(value),
        category: (value: string) => InputSanitizer.sanitizeText(value),
        filters: (value: any) => {
            // Validate filter object structure
            if (typeof value !== 'object') {
                throw new Error('Invalid filter format');
            }
            return value;
        },
    },

    // File upload
    FILE_UPLOAD: {
        filename: (value: string) => InputSanitizer.sanitizeFilename(value),
        mimetype: (value: string) => {
            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/webp',
                'image/gif',
                'application/pdf',
            ];

            if (!allowedTypes.includes(value)) {
                throw new Error('Invalid file type');
            }

            return value;
        },
    },
};

// Validate and sanitize input based on schema
export function validateInput<T extends Record<string, any>>(
    data: T,
    schema: keyof typeof VALIDATION_SCHEMAS
): T {
    const validators = VALIDATION_SCHEMAS[schema];
    const sanitized = { ...data };

    for (const [key, validator] of Object.entries(validators)) {
        if (key in sanitized) {
            try {
                (sanitized as any)[key] = validator((sanitized as any)[key]);
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Validation failed for ${key}: ${message}`);
            }
        }
    }

    return sanitized;
}
