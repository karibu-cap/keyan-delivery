import { getSessionCookie } from 'better-auth/cookies';
import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales } from './i18n/config';
import { routing } from './i18n/routing';
import { 
  getUserFromCookie, 
  hasRole, 
  shouldRedirectToApply, 
  shouldRedirectToReview, 
  isDriverApproved 
} from './lib/utils/middleware-helpers';


// Fetch driver status from database and cache it
// async function fetchAndCacheDriverStatus(authId: string, request: NextRequest) {
// try {
//   const res = await fetch(`${request.nextUrl.origin}/api/v1/users/${authId}`
//     , {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         authId,
//       }),
//     }
//   );
//   const result = await res.json();
//   const driverStatus = result.data.driverStatus;

//   if (driverStatus) {
//     const response = NextResponse.next();
//     response.cookies.set('driver-status', driverStatus, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       maxAge: 60 * 60,
//       path: '/',
//     });
//   }
//   return result.data;
// } catch (error) {
//   console.error('Error fetching driver status:', error);
//   return null;
// }


// // Driver route protection
// if (basePath.startsWith('/driver')) {
//   console.log('1 allow', basePath)
//   console.log('1 allow', basePath)
//   console.log('1 allow', basePath)
//   console.log('1 allow', basePath)
//   console.log('1 allow', basePath)
//   console.log('1 allow', basePath)
//   const user = await fetchAndCacheDriverStatus(decodedToken.uid, request);
//   const locale = pathname.match(/^\/([a-z]{2})\//)?.[1] || 'en';

//   if (!user.roles.includes('driver')) {
//     console.log('2 allow', basePath)
//     console.log('2 allow', basePath)
//     console.log('2 allow', user?.driverStatus)
//     const redirectUrl = new URL(`/${locale}/driver/apply`, request.url);
//     return NextResponse.redirect(redirectUrl);
//   }

//   // Check if route requires approval
//   if (basePath != '/driver/review' && user?.driverStatus !== 'APPROVED') {
//     // Redirect non-approved drivers to review page
//     console.log('3 allow', basePath)
//     console.log('3 allow', user.roles)
//     console.log('3 allow', user?.driverStatus)
//     const redirectUrl = new URL(`/${locale}/driver/review`, request.url);
//     return NextResponse.redirect(redirectUrl);
//   }

//   // Check if route requires approval
//   if (basePath != '/driver/review' && requiresDriverApproval(basePath) && user?.driverStatus !== 'APPROVED') {
//     // Redirect non-approved drivers to review page
//     console.log('3 allow', basePath)
//     console.log('3 allow', basePath)
//     console.log('3 allow', basePath)
//     const redirectUrl = new URL(`/${locale}/driver/review`, request.url);
//     return NextResponse.redirect(redirectUrl);
//   }
//   if (basePath != '/driver/dashboard' && !requiresDriverApproval(basePath) && user?.driverStatus === 'APPROVED') {
//     console.log('4 allow', basePath)
//     console.log('4 allow', basePath)
//     console.log('4 allow', basePath)
//     const redirectUrl = new URL(`/${locale}/driver/dashboard`, request.url);
//     return NextResponse.redirect(redirectUrl);
//   }
// }

// }

// // Check if route requires driver approval
// function requiresDriverApproval(path: string): boolean {
//   return DRIVER_PROTECTED_ROUTES.includes(path) || path.startsWith('/driver/order');
// }

// // Check if route requires driver approval
// function isPublicDriverRoute(path: string): boolean {
//   return DRIVER_PUBLIC_ROUTES.includes(path);
// }

const intlMiddleware = createIntlMiddleware(routing);

const UN_AUTH_PUBLIC_PATHS = ['/reset-password', '/sign-in', '/sign-up'];
const PUBLIC_PATHS = [
  '/',
  '/stores',
  new RegExp('^/stores/.*$'),
  new RegExp('^/products/.*$'),
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
  return new RegExp(`^/(${localePattern})(/|$)`).test(path);
}

function removeLocaleFromPath(path: string) {
  const localePattern = locales.join('|');
  const regex = new RegExp(`^/(${localePattern})(/|$)`);
  return path.replace(regex, '/');
}

function isProtectedPath(pathname: string): boolean {
  return !PUBLIC_PATHS.some((path) => typeof path === 'string' ? pathname === path : path.test(pathname));
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const basePath = hasLocale(pathname) ? removeLocaleFromPath(pathname) : pathname;

  // Skip middleware for API routes and static files
  if (
    basePath.startsWith('/api') ||
    basePath.startsWith('/_next') ||
    basePath.startsWith('/_vercel') ||
    basePath.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request, {
    cookiePrefix: "yetu"
  });

  if (isProtectedPath(basePath)) {
    if (!sessionCookie) {
      const locale = hasLocale(pathname) ? pathname.split('/')[1] : '';
      const redirectUrl = new URL(
        locale ? `/${locale}/sign-in` : '/sign-in',
        request.url
      );
      redirectUrl.searchParams.set('redirect', basePath);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if (sessionCookie && ['/sign-in', '/sign-up'].includes(basePath)) {
    const redirectTo = request.nextUrl.searchParams.get('redirect') || '/';
    const locale = hasLocale(pathname) ? pathname.split('/')[1] : '';
    const redirectUrl = new URL(
      locale ? `/${locale}${redirectTo}` : redirectTo,
      request.url
    );
    return NextResponse.redirect(redirectUrl);
  }

  // Driver route protection using cookie data
  if (basePath.startsWith('/driver') && sessionCookie) {
    const userData = getUserFromCookie(request);
    const locale = hasLocale(pathname) ? pathname.split('/')[1] : '';

    // If user data is not in cookie, let them through (will be set on next login)
    if (!userData) {
      return intlMiddleware(request);
    }

    // User is not a driver yet -> redirect to apply page
    if (basePath !== '/driver/apply' && shouldRedirectToApply(userData)) {
      const redirectUrl = new URL(
        locale ? `/${locale}/driver/apply` : '/driver/apply',
        request.url
      );
      return NextResponse.redirect(redirectUrl);
    }

    // Driver is pending/rejected/banned -> redirect to review page
    if (basePath !== '/driver/review' && shouldRedirectToReview(userData)) {
      const redirectUrl = new URL(
        locale ? `/${locale}/driver/review` : '/driver/review',
        request.url
      );
      return NextResponse.redirect(redirectUrl);
    }

    // Driver is approved but trying to access apply/review -> redirect to dashboard
    if ((basePath === '/driver/apply' || basePath === '/driver/review') && isDriverApproved(userData)) {
      const redirectUrl = new URL(
        locale ? `/${locale}/driver/dashboard` : '/driver/dashboard',
        request.url
      );
      return NextResponse.redirect(redirectUrl);
    }

    // Driver is not approved trying to access protected routes -> redirect to review
    if (
      basePath !== '/driver/review' && 
      basePath !== '/driver/apply' && 
      !isDriverApproved(userData) && 
      hasRole(userData, 'driver')
    ) {
      const redirectUrl = new URL(
        locale ? `/${locale}/driver/review` : '/driver/review',
        request.url
      );
      return NextResponse.redirect(redirectUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api/auth|_next|_vercel|.*\\..*).*)'],
};
