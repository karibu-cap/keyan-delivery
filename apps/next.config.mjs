
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    productionBrowserSourceMaps: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
                pathname: '/tmp/**',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            }, {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'loremflickr.com',
            },
        ],
        // Enable modern image optimization features
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    },

    experimental: {
        optimizePackageImports: ['lucide-react'],
    },
    // Use local cache directory for better performance
    distDir: process.env.NODE_ENV === 'development' ? '.next-local' : '.next',
    // Enable compression for better performance
    compress: true,
    // Configure powered by header removal for security
    poweredByHeader: false,
    // Enable strict mode for React
    reactStrictMode: true,
    // Configure SWC minification (handled automatically in newer Next.js versions)
    // Enable modern JavaScript features
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    webpack: (config, { isServer }) => {
        // Allow Service Worker to be served from /public
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
            };
        }
        return config;
    },
    // Configure headers for caching and security
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin',
                    },
                ],
            },
            // Cache API routes appropriately
            {
                source: '/api/v1/client/(products|merchants|categories)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=300, s-maxage=600',
                    },
                ],
            },
            // Cache search results for shorter periods
            {
                source: '/api/v1/client/search',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=60, s-maxage=120',
                    },
                ],
            },
            {
                source: '/sw.js',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'application/javascript; charset=utf-8',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'no-cache, no-store, must-revalidate',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self'",
                    },
                ],
            },
        ];
    },

}

export default withNextIntl(nextConfig)