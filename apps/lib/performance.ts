// Performance monitoring and analytics utilities
import { NextRequest, NextResponse } from 'next/server';

// Performance metrics interface
export interface PerformanceMetrics {
    // Core Web Vitals
    fcp?: number; // First Contentful Paint
    lcp?: number; // Largest Contentful Paint
    cls?: number; // Cumulative Layout Shift
    fid?: number; // First Input Delay
    ttfb?: number; // Time to First Byte

    // Custom metrics
    pageLoadTime?: number;
    domContentLoaded?: number;
    firstPaint?: number;

    // Resource metrics
    totalRequests?: number;
    totalSize?: number;
    cacheHits?: number;

    // User experience
    bounceRate?: number;
    sessionDuration?: number;
    pageViews?: number;

    // Error tracking
    errorCount?: number;
    errorRate?: number;

    // Business metrics
    conversionRate?: number;
    cartAbandonmentRate?: number;
}

// Web Vitals tracking
export function trackWebVitals() {
    if (typeof window === 'undefined') return;

    // First Contentful Paint
    new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
                reportMetric('FCP', entry.startTime);
            }
        }
    }).observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        reportMetric('LCP', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            const fidEntry = entry as PerformanceEventTiming;
            reportMetric('FID', fidEntry.processingStart - entry.startTime);
        }
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
            }
        }
        reportMetric('CLS', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
}

// Report metric to analytics service
function reportMetric(name: string, value: number) {
    // Send to Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', name.toLowerCase(), {
            value: Math.round(value),
            event_category: 'Web Vitals',
            event_label: name,
        });
    }

    // Send to custom analytics endpoint
    if (typeof window !== 'undefined') {
        fetch('/api/analytics/metrics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                value,
                timestamp: Date.now(),
                url: window.location.href,
                userAgent: navigator.userAgent,
            }),
        }).catch(error => {
            console.error('Failed to report metric:', error);
        });
    }
}

// Server-side performance monitoring
export function monitorRequestPerformance(request: NextRequest) {
    const startTime = Date.now();

    return {
        end: () => {
            const endTime = Date.now();
            const duration = endTime - startTime;

            // Log slow requests
            if (duration > 1000) {
                console.warn(`Slow request detected: ${request.nextUrl.pathname} took ${duration}ms`);
            }

            return {
                duration,
                path: request.nextUrl.pathname,
                method: request.method,
                userAgent: request.headers.get('user-agent'),
            };
        }
    };
}

// Database query performance monitoring
export function monitorDatabasePerformance<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    queryName: string
) {
    return async (...args: T): Promise<R> => {
        const startTime = Date.now();

        try {
            const result = await fn(...args);
            const duration = Date.now() - startTime;

            // Log slow queries
            if (duration > 500) {
                console.warn(`Slow database query: ${queryName} took ${duration}ms`);
            }

            // Report to monitoring service
            reportDatabaseMetric(queryName, duration, 'success');

            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            reportDatabaseMetric(queryName, duration, 'error', error);
            throw error;
        }
    };
}

// Report database metrics
function reportDatabaseMetric(
    queryName: string,
    duration: number,
    status: 'success' | 'error',
    error?: any
) {
    // Send to monitoring service
    fetch('/api/analytics/database', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            queryName,
            duration,
            status,
            error: error?.message,
            timestamp: Date.now(),
        }),
    }).catch(err => {
        console.error('Failed to report database metric:', err);
    });
}

// Cache performance monitoring
export class CacheMonitor {
    private hits = 0;
    private misses = 0;
    private errors = 0;

    recordHit() {
        this.hits++;
    }

    recordMiss() {
        this.misses++;
    }

    recordError() {
        this.errors++;
    }

    getStats() {
        const total = this.hits + this.misses;
        return {
            hits: this.hits,
            misses: this.misses,
            errors: this.errors,
            hitRate: total > 0 ? (this.hits / total) * 100 : 0,
            totalRequests: total,
        };
    }

    reset() {
        this.hits = 0;
        this.misses = 0;
        this.errors = 0;
    }
}

// Global cache monitor instance
export const cacheMonitor = new CacheMonitor();

// Real User Monitoring (RUM)
export function initializeRUM() {
    if (typeof window === 'undefined') return;

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
        reportMetric('visibility_change', document.visibilityState === 'visible' ? 1 : 0);
    });

    // Track user interactions
    window.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const elementType = target.tagName.toLowerCase();
        const elementClasses = target.className;

        // Report interaction metrics
        fetch('/api/analytics/interaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'click',
                elementType,
                elementClasses,
                timestamp: Date.now(),
                url: window.location.href,
            }),
        }).catch(error => {
            console.error('Failed to report interaction:', error);
        });
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
        const scrollDepth = Math.round(
            (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );

        if (scrollDepth > maxScrollDepth) {
            maxScrollDepth = scrollDepth;

            if (scrollDepth % 25 === 0) { // Report at 25%, 50%, 75%, 100%
                reportMetric('scroll_depth', scrollDepth);
            }
        }
    });

    // Track time spent on page
    const startTime = Date.now();
    window.addEventListener('beforeunload', () => {
        const timeSpent = Date.now() - startTime;
        reportMetric('time_on_page', Math.round(timeSpent / 1000));
    });
}

// A/B Testing utilities
export class ABTestManager {
    private tests = new Map<string, ABTest>();

    registerTest(test: ABTest) {
        this.tests.set(test.name, test);
    }

    getVariant(testName: string, userId?: string): string | null {
        const test = this.tests.get(testName);
        if (!test) return null;

        // Simple hash-based assignment (replace with more sophisticated logic)
        const hash = this.simpleHash(userId || 'anonymous');
        const variantIndex = hash % test.variants.length;
        return test.variants[variantIndex];
    }

    trackConversion(testName: string, variant: string, value?: number) {
        reportMetric(`ab_test_${testName}_${variant}_conversion`, value || 1);
    }

    private simpleHash(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
}

interface ABTest {
    name: string;
    variants: string[];
    traffic: number; // Percentage of users to include (0-100)
}

// Global A/B test manager
export const abTestManager = new ABTestManager();

// Performance budgets
export const PERFORMANCE_BUDGETS = {
    // Core Web Vitals targets
    FCP: 1800, // 1.8 seconds
    LCP: 2500, // 2.5 seconds
    CLS: 0.1,  // 0.1
    FID: 100,  // 100ms

    // Custom budgets
    PAGE_LOAD_TIME: 3000, // 3 seconds
    FIRST_PAINT: 1500,    // 1.5 seconds
    API_RESPONSE_TIME: 500, // 500ms
    IMAGE_LOAD_TIME: 2000,  // 2 seconds

    // Bundle size budgets
    MAIN_BUNDLE_SIZE: 500 * 1024, // 500KB
    VENDOR_BUNDLE_SIZE: 300 * 1024, // 300KB
    TOTAL_JS_SIZE: 1000 * 1024, // 1MB
} as const;

// Check if performance budget is exceeded
export function checkPerformanceBudget(
    metric: keyof typeof PERFORMANCE_BUDGETS,
    value: number
): boolean {
    const budget = PERFORMANCE_BUDGETS[metric];
    const exceeded = value > budget;

    if (exceeded) {
        console.warn(`Performance budget exceeded for ${metric}: ${value}ms (budget: ${budget}ms)`);

        // Report budget violation
        reportMetric(`${metric}_budget_exceeded`, value);
    }

    return exceeded;
}

// Resource timing analysis
export function analyzeResourceTiming() {
    if (typeof window === 'undefined' || !window.performance) return;

    const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    const analysis = {
        totalResources: resources.length,
        totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        cacheHits: resources.filter(r => r.transferSize === 0).length,
        slowResources: resources.filter(r => r.duration > 1000).length,
        byType: {} as Record<string, number>,
        byDomain: {} as Record<string, number>,
    };

    resources.forEach(resource => {
        // By type
        const type = resource.name.split('.').pop() || 'unknown';
        analysis.byType[type] = (analysis.byType[type] || 0) + 1;

        // By domain
        try {
            const domain = new URL(resource.name).hostname;
            analysis.byDomain[domain] = (analysis.byDomain[domain] || 0) + 1;
        } catch {
            analysis.byDomain['unknown'] = (analysis.byDomain['unknown'] || 0) + 1;
        }
    });

    return analysis;
}

// Edge performance monitoring
export class EdgePerformanceMonitor {
    static startTime = Date.now();

    static measureEdgeFunction(
        functionName: string,
        startTime: number = Date.now()
    ) {
        const duration = Date.now() - startTime;

        // Log performance metrics
        console.log(`Edge function ${functionName} took ${duration}ms`);

        return duration;
    }

    static async reportEdgeMetrics(metrics: {
        functionName: string;
        duration: number;
        region: string;
        cacheHit?: boolean;
    }) {
        // In production, send to monitoring service like DataDog, New Relic, etc.
        if (process.env.NODE_ENV === 'production') {
            try {
                await fetch('/api/v1/analytics/edge-metrics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(metrics),
                });
            } catch (error) {
                console.warn('Failed to report edge metrics:', error);
            }
        }
    }
}

// Edge cache utilities
export class EdgeCache {
    // Cache key generation
    static generateCacheKey(request: NextRequest, prefix = 'edge'): string {
        const url = request.nextUrl.pathname;
        const userAgent = request.headers.get('user-agent') || '';
        const acceptLanguage = request.headers.get('accept-language') || '';

        // Create a hash of the request characteristics
        const keyData = `${prefix}:${url}:${userAgent}:${acceptLanguage}`;
        return btoa(keyData).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
    }

    // Set cache headers for edge caching
    static setCacheHeaders(
        response: NextResponse,
        options: {
            maxAge?: number;
            staleWhileRevalidate?: number;
            serveStaleOnError?: boolean;
        } = {}
    ): NextResponse {
        const config = {
            maxAge: 60 * 60 * 24, // 24 hours
            staleWhileRevalidate: 60 * 60, // 1 hour
            serveStaleOnError: true,
            ...options,
        };

        response.headers.set(
            'Cache-Control',
            `public, max-age=${config.maxAge}, stale-while-revalidate=${config.staleWhileRevalidate}`
        );

        if (config.serveStaleOnError) {
            response.headers.set('Cache-Control', `${response.headers.get('Cache-Control')}, stale-if-error=86400`);
        }

        return response;
    }

    // Check if request should be served from edge cache
    static shouldServeFromCache(request: NextRequest): boolean {
        const method = request.method;
        const userAgent = request.headers.get('user-agent') || '';

        // Only cache GET requests
        if (method !== 'GET') {
            return false;
        }

        // Don't cache requests from bots (except search engines)
        if (userAgent.includes('bot') && !userAgent.includes('Google') && !userAgent.includes('Bing')) {
            return false;
        }

        // Cache static assets and API responses
        const pathname = request.nextUrl.pathname;
        return pathname.startsWith('/api/') ||
               pathname.includes('.') ||
               pathname.startsWith('/_next/');
    }
}

// Geographic routing based on user location
export class GeographicRouter {
    private static instance: GeographicRouter;
    private userRegions = new Map<string, string>();

    static getInstance(): GeographicRouter {
        if (!GeographicRouter.instance) {
            GeographicRouter.instance = new GeographicRouter();
        }
        return GeographicRouter.instance;
    }

    // Determine optimal region based on user location
    getOptimalRegion(request: NextRequest): string {
        const userIP = this.getClientIP(request);
        const userAgent = request.headers.get('user-agent') || '';

        // Check cache first
        if (this.userRegions.has(userIP)) {
            return this.userRegions.get(userIP)!;
        }

        // Determine region based on IP and user agent
        let region = this.detectRegionFromIP(userIP);

        // Fallback logic
        if (!region) {
            region = this.detectRegionFromUserAgent(userAgent);
        }

        // Default to closest major region
        if (!region) {
            region = 'iad1'; // Default to US East
        }

        // Cache the result
        this.userRegions.set(userIP, region);

        return region;
    }

    private getClientIP(request: NextRequest): string {
        // Check for forwarded IP headers
        const forwardedFor = request.headers.get('x-forwarded-for');
        if (forwardedFor) {
            return forwardedFor.split(',')[0].trim();
        }

        const realIP = request.headers.get('x-real-ip');
        if (realIP) {
            return realIP;
        }

        const cfConnectingIP = request.headers.get('cf-connecting-ip');
        if (cfConnectingIP) {
            return cfConnectingIP;
        }

        return 'unknown';
    }

    private detectRegionFromIP(ip: string): string | null {
        // Simple IP-based region detection (in production, use a proper GeoIP service)
        if (ip.startsWith('41.') || ip.startsWith('42.')) {
            return 'iad1'; // US East
        }
        if (ip.startsWith('104.') || ip.startsWith('108.')) {
            return 'sfo1'; // US West
        }
        if (ip.startsWith('185.') || ip.startsWith('192.')) {
            return 'lhr1'; // UK
        }

        return null;
    }

    private detectRegionFromUserAgent(userAgent: string): string {
        // Language-based region detection
        if (userAgent.includes('zh')) {
            return 'hkg1'; // China/Hong Kong
        }
        if (userAgent.includes('ja')) {
            return 'nrt1'; // Japan
        }
        if (userAgent.includes('fr') || userAgent.includes('de')) {
            return 'fra1'; // Europe
        }

        return 'iad1'; // Default
    }
}

// Edge runtime configuration
export const EDGE_RUNTIME_CONFIG = {
    // Runtime selection based on endpoint type
    runtime: {
        api: 'nodejs', // Keep API routes on Node.js for database access
        pages: 'edge', // Static pages can run on edge
        middleware: 'edge', // Middleware runs on edge for performance
    },

    // Geographic distribution
    regions: [
        'iad1', // Washington D.C., USA
        'sfo1', // San Francisco, USA
        'lax1', // Los Angeles, USA
        'ord1', // Chicago, USA
        'dfw1', // Dallas, USA
        'den1', // Denver, USA
        'yyz1', // Toronto, Canada
        'lhr1', // London, UK
        'fra1', // Frankfurt, Germany
        'cdg1', // Paris, France
        'ams1', // Amsterdam, Netherlands
        'arn1', // Stockholm, Sweden
        'hel1', // Helsinki, Finland
        'sin1', // Singapore
        'syd1', // Sydney, Australia
        'nrt1', // Tokyo, Japan
        'hkg1', // Hong Kong
        'bom1', // Mumbai, India
    ],

    // Cache configuration for edge
    cache: {
        maxAge: 60 * 60 * 24, // 24 hours
        staleWhileRevalidate: 60 * 60, // 1 hour
        serveStaleOnError: true,
    },

    // CDN configuration
    cdn: {
        enabled: true,
        providers: ['cloudflare', 'aws'],
        fallback: 'nodejs',
    },
} as const;

// Error tracking and reporting
export class ErrorTracker {
    private errors: Array<{
        message: string;
        stack?: string;
        timestamp: number;
        url: string;
        userAgent: string;
        count: number;
    }> = [];

    trackError(error: Error, context?: Record<string, any>) {
        const errorInfo = {
            message: error.message,
            stack: error.stack,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            count: 1,
        };

        // Check if this error already exists (within last hour)
        const existingError = this.errors.find(e => {
            const timeDiff = errorInfo.timestamp - e.timestamp;
            return e.message === errorInfo.message &&
                   e.url === errorInfo.url &&
                   timeDiff < 60 * 60 * 1000; // 1 hour
        });

        if (existingError) {
            existingError.count++;
        } else {
            this.errors.push(errorInfo);
        }

        // Report to external service
        this.reportError(errorInfo, context);
    }

    private reportError(errorInfo: any, context?: Record<string, any>) {
        fetch('/api/analytics/errors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...errorInfo,
                context,
            }),
        }).catch(err => {
            console.error('Failed to report error:', err);
        });
    }

    getErrorStats() {
        return {
            totalErrors: this.errors.reduce((sum, e) => sum + e.count, 0),
            uniqueErrors: this.errors.length,
            errors: this.errors.slice(0, 50), // Last 50 errors
        };
    }
}

// Global error tracker
export const errorTracker = new ErrorTracker();

// Initialize error tracking
if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
        errorTracker.trackError(new Error(event.message), {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
        });
    });

    window.addEventListener('unhandledrejection', (event) => {
        errorTracker.trackError(new Error(event.reason), {
            type: 'unhandled_promise_rejection',
        });
    });
}
