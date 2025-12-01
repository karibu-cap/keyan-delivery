// lib/utils/middleware-helpers.ts
// Utilities for middleware to read user data from cookies

import { NextRequest } from 'next/server';

// Define types locally to avoid importing Prisma in Edge Runtime
type UserRole = 'customer' | 'driver' | 'merchant' | 'admin';
type DriverStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'BANNED';

export interface UserCookieData {
   id: string;
   roles: UserRole[];
   driverStatus: DriverStatus | null;
}

/**
 * Reads user data from cookie in middleware
 * Returns null if cookie doesn't exist or is invalid
 */
export function getUserFromCookie(request: NextRequest): UserCookieData | null {
   try {
      const cookieValue = request.cookies.get('pataupesi-user-data')?.value;

      if (!cookieValue) {
         return null;
      }

      const userData = JSON.parse(cookieValue) as UserCookieData;

      // Validate required fields
      if (!userData.id || !Array.isArray(userData.roles)) {
         return null;
      }

      return userData;
   } catch (error) {
      console.error('Error reading user cookie:', error);
      return null;
   }
}

/**
 * Check if user has a specific role
 */
export function hasRole(userData: UserCookieData | null, role: UserRole): boolean {
   return userData?.roles.includes(role) ?? false;
}

/**
 * Check if driver is approved
 */
export function isDriverApproved(userData: UserCookieData | null): boolean {
   return hasRole(userData, 'driver') && userData?.driverStatus === 'APPROVED';
}

/**
 * Check if driver is pending
 */
export function isDriverPending(userData: UserCookieData | null): boolean {
   return hasRole(userData, 'driver') && userData?.driverStatus === 'PENDING';
}

/**
 * Check if driver is rejected
 */
export function isDriverRejected(userData: UserCookieData | null): boolean {
   return hasRole(userData, 'driver') && userData?.driverStatus === 'REJECTED';
}

/**
 * Check if driver is banned
 */
export function isDriverBanned(userData: UserCookieData | null): boolean {
   return hasRole(userData, 'driver') && userData?.driverStatus === 'BANNED';
}

/**
 * Check if user should be redirected to apply page
 */
export function shouldRedirectToApply(userData: UserCookieData | null): boolean {
   return userData !== null && !hasRole(userData, 'driver');
}

/**
 * Check if user should be redirected to review page
 */
export function shouldRedirectToReview(userData: UserCookieData | null): boolean {
   return hasRole(userData, 'driver') &&
      (isDriverPending(userData) || isDriverRejected(userData) || isDriverBanned(userData));
}

/**
 * Check if user should be redirected to dashboard
 */
export function shouldRedirectToDashboard(userData: UserCookieData | null): boolean {
   return isDriverApproved(userData);
}
