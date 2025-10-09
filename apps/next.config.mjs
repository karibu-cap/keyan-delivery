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
                hostname: 'keyan-delivery.com',
                port: '3000',
                pathname: '/tmp/**',
            },
            {
                protocol: 'https',
                hostname: 'loremflickr.com',
            },
        ],
    },
    experimental: {
        optimizePackageImports: ['lucide-react'],
        turbo: {
            rules: {
                '*.svg': {
                    loaders: ['@svgr/webpack'],
                    as: '*.js',
                },
            },
            resolveExtensions: ['.tsx', '.ts', '.jsx', '.js'],
        },
    },
    // Use local cache directory for better performance
    distDir: process.env.NODE_ENV === 'development' ? '.next-local' : '.next',
}

export default nextConfig