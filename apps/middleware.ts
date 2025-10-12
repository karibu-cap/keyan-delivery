// middleware.ts
import { authMiddleware, redirectToHome, redirectToLogin } from 'next-firebase-auth-edge';
import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { clientConfig, serverConfig } from './auth_config';
import { routing } from './i18n/routing';

const UN_AUTH_PUBLIC_PATHS = ['/reset-password', '/sign-in', '/sign-up'];
const PUBLIC_PATHS = [
  '/',
  '/stores',
  new RegExp('^/stores/.*$'),
  new RegExp('^/(api|trpc)/.*$'),
  '/cart',
  '/checkout',
  '/sign-in',
  '/sign-up',
  '/sitemap.xml',
  '/robots.txt',
  '/not-found',
];

const intlMiddleware = createIntlMiddleware(routing);


export async function middleware(request: NextRequest) {
  // First, apply i18n middleware to handle locale routing
  const response = intlMiddleware(request);

  // If intlMiddleware already handled the request (e.g., redirect), return it
  if (response.status !== 200 || response.headers.has('x-middleware-rewrite')) {
    return response;
  }

  // Apply auth middleware to the response from intlMiddleware
  return authMiddleware(request, {
    loginPath: '/api/login',
    logoutPath: '/api/logout',
    refreshTokenPath: '/api/refresh-token',
    apiKey: clientConfig.apiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys,
    cookieSerializeOptions: {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 12 * 60 * 60 * 24,
    },
    serviceAccount: serverConfig.serviceAccount,
    enableMultipleCookies: true,
    enableCustomToken: false,
    debug: true,
    checkRevoked: true,
    authorizationHeaderName: 'Authorization',
    handleValidToken: async ({ token, decodedToken }, headers) => {
      const pathname = request.nextUrl.pathname;

      // Assume locales are optional 2-letter prefixes like /en/, /fr/, etc. (case-insensitive)
      const localeRegex = /^\/[a-z]{2}\/?/i;

      const basePath = localeRegex.test(pathname) ? pathname.replace(localeRegex, '/') : pathname;

      // Check if token is expired
      if (decodedToken.exp < Date.now() / 1000) {
        if (PUBLIC_PATHS.some((path) => {
          if (typeof path === 'string') {
            return basePath === path;
          } else {
            return path.test(basePath);
          }
        })) {
          // For public paths, apply intlMiddleware
          const intlResponse = intlMiddleware(request);
          intlResponse.headers.forEach((value, key) => {
            if (!response.headers.has(key)) {
              response.headers.set(key, value);
            }
          });
          return intlResponse;
        }
        return redirectToLogin(request, {
          path: '/sign-in',
          publicPaths: PUBLIC_PATHS,
        });
      }

      // Check if user is trying to access unauthorized public paths
      if (UN_AUTH_PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
        return redirectToHome(request);
      }

      // Token is valid, return the intlMiddleware response
      // Preserve any headers set by intlMiddleware
      const intlResponse = intlMiddleware(request);

      // Clone headers from intlResponse to preserve locale information
      intlResponse.headers.forEach((value, key) => {
        if (!response.headers.has(key)) {
          response.headers.set(key, value);
        }
      });

      return response;
    },
    handleInvalidToken: async (reason) => {
      console.info('Missing or malformed credentials', { reason });

      // Handle network-related token issues
      const pathname = request.nextUrl.pathname;

      // Assume locales are optional 2-letter prefixes like /en/, /fr/, etc. (case-insensitive)
      const localeRegex = /^\/[a-z]{2}\/?/i;

      const basePath = localeRegex.test(pathname) ? pathname.replace(localeRegex, '/') : pathname;
      if (PUBLIC_PATHS.some((path) => {
        if (typeof path === 'string') {
          return basePath === path;
        } else {
          return path.test(basePath);
        }
      })) {
        // For public paths, apply intlMiddleware
        const intlResponse = intlMiddleware(request);
        intlResponse.headers.forEach((value, key) => {
          if (!response.headers.has(key)) {
            response.headers.set(key, value);
          }
        });
        return intlResponse;
      }

      return redirectToLogin(request, {
        path: '/sign-in',
        publicPaths: PUBLIC_PATHS,
      });
    },
    handleError: async (error) => {
      console.error('Unhandled authentication error', { error });

      const errorString = String(error);
      const isFetchError = errorString.includes('fetch failed') ||
        errorString.includes('INTERNAL_ERROR') ||
        errorString.includes('network');

      if (isFetchError) {
        console.warn('Network error detected, allowing access to public paths');

        if (PUBLIC_PATHS.some((path) => {
          if (typeof path === 'string') {
            return request.nextUrl.pathname === path;
          } else {
            return path.test(request.nextUrl.pathname);
          }
        })) {
          const intlResponse = intlMiddleware(request);
          intlResponse.headers.forEach((value, key) => {
            if (!response.headers.has(key)) {
              response.headers.set(key, value);
            }
          });
          return intlResponse;
        }
      }

      return redirectToLogin(request, {
        path: '/sign-in',
        publicPaths: PUBLIC_PATHS,
      });
    },
  });
}

// Updated matcher to ensure locale paths are handled
export const config = {
  matcher: [
    '/api/refresh-token',
    '/api/login',
    '/api/logout',
    '/((?!_next|favicon.ico|api|.*\\.).*)',
  ],
};