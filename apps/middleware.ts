import { authMiddleware, redirectToHome, redirectToLogin } from 'next-firebase-auth-edge';
import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { clientConfig, serverConfig } from './auth_config';
import { locales } from './i18n/config';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

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

function hasLocale(path: string) {
  const localePattern = locales.join('|');
  return (new RegExp(`^/(${localePattern})(/|$)`).test(path));
}

function removeLocaleFromPath(path: string) {
  const localePattern = locales.join('|');
  const regex = new RegExp(`^/(${localePattern})(/|$)`);
  return path.replace(regex, '/');
}



export async function middleware(request: NextRequest) {
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
    handleValidToken: async ({ decodedToken }, headers) => {
      const pathname = request.nextUrl.pathname;

      // Assume locales are optional 2-letter prefixes like /en/, /fr/, etc. (case-insensitive)
      const basePath = hasLocale(pathname) ? removeLocaleFromPath(pathname) : pathname;

      // Check if token is expired (though authMiddleware typically invalidates expired tokens; this is redundant but preserved)
      if (decodedToken.exp < Date.now() / 1000) {
        if (PUBLIC_PATHS.some((path) => typeof path === 'string' ? basePath === path : path.test(basePath))) {
          return applyIntl(request); // Apply i18n for public paths
        }
        return redirectToLogin(request, {
          path: '/sign-in',
          publicPaths: PUBLIC_PATHS,
        });
      }

      // Redirect authenticated users from unauth public paths
      if (UN_AUTH_PUBLIC_PATHS.includes(basePath)) {
        return redirectToHome(request);
      }

      // For valid tokens on protected paths, apply i18n and propagate auth headers for token caching
      return applyIntl(request, headers);
    },
    handleInvalidToken: async (reason) => {
      console.info('Missing or malformed credentials', { reason });

      const pathname = request.nextUrl.pathname;
      const basePath = hasLocale(pathname) ? removeLocaleFromPath(pathname) : pathname;
      if (PUBLIC_PATHS.some((path) => typeof path === 'string' ? basePath === path : path.test(basePath))) {
        return applyIntl(request); // Apply i18n for public paths
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

        const pathname = request.nextUrl.pathname;
        const basePath = hasLocale(pathname) ? removeLocaleFromPath(pathname) : pathname;
        if (PUBLIC_PATHS.some((path) => typeof path === 'string' ? basePath === path : path.test(basePath))) {
          return applyIntl(request); // Apply i18n for public paths
        }
      }

      return redirectToLogin(request, {
        path: '/sign-in',
        publicPaths: PUBLIC_PATHS,
      });
    },
  });
}

// Helper to apply intlMiddleware and merge with auth headers where needed
function applyIntl(request: NextRequest, authHeaders?: Headers, authResponse?: NextResponse) {
  // If auth middleware wants to redirect (e.g., to login), apply intl to that redirect

  if (authResponse) {
    // Extract the redirect path from auth response
    const redirectUrl = new URL(authResponse.headers.get('location') || authResponse.url);
    // Create a new request with the redirect path to let intl middleware handle locale
    const redirectRequest = new NextRequest(redirectUrl, request);
    const intlResponse = intlMiddleware(redirectRequest);

    // Return the intl response which will add locale to the redirect path
    return intlResponse;
  }

  // Normal flow: apply intl middleware
  const intlResponse = intlMiddleware(request);

  // If i18n redirects (e.g., adding locale to URL like /stores -> /en/stores)
  if (intlResponse.status === 307 || intlResponse.status === 308 || intlResponse.redirected) {
    return intlResponse;
  }

  // If i18n rewrites the URL
  if (intlResponse.headers.has('x-middleware-rewrite')) {

    const rewriteUrl = new URL(intlResponse.headers.get('x-middleware-rewrite')!);
    return NextResponse.rewrite(rewriteUrl, {
      request: { headers: authHeaders },
      headers: intlResponse.headers,
    });
  }

  // For normal processing, propagate auth headers
  return NextResponse.next({
    request: { headers: authHeaders },
    headers: intlResponse.headers,
  });
}


// Keep your matcher (it already excludes general API/trpc but includes specific auth APIs)
export const config =  {
  matcher: [
    '/api/refresh-token',
    '/api/login',
    '/api/logout',
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
  ],
};
