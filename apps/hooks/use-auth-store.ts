'use client';

import { getUserById } from '@/lib/actions/client';
import { getUser, signIn, signOut, signUp } from '@/lib/auth-client';
import { ROUTES } from '@/lib/router';
import { updateUserCookie, clearUserCookie } from '@/lib/utils/user-cookie';
import type { User } from '@prisma/client';
import { User as BetterAuthUser } from 'better-auth';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SignUpData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  callbackUrl?: string;
}

interface AuthState {
  authUser: BetterAuthUser | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  lastOnlineSync: number | null;

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Auth methods
  signIn: (email: string, password: string, callbackUrl?: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signInWithGoogle: (redirectUrl?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;

  // Helpers
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      authUser: null,
      user: null,
      loading: false,
      error: null,
      isOnline: true,
      lastOnlineSync: null,

      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      refreshSession: async () => {
        try {
          const authUser = await getUser();

          if (!authUser) {
            return;
          }

          const user = await getUserById(authUser.id);

          if (authUser) {
            set({
              authUser: authUser,
              user: user,
              lastOnlineSync: Date.now(),
            });

            // Update user cookie for middleware access
            await updateUserCookie();
          }

        } catch (error) {
          console.error('Failed to refresh session:', error);
        }
      },
      signIn: async (email: string, password: string, callbackUrl?: string) => {
        try {
          set({ loading: true, error: null });

          const { error } = await signIn.email({
            email,
            password,
            callbackURL: callbackUrl || ROUTES.home
          });

          if (error) {
            throw new Error(error.message);
          }

          const authUser = await getUser();

          if (!authUser) {
            throw new Error('Failed to get user');
          }

          const user = await getUserById(authUser.id);

          set({
            authUser: authUser,
            user: user,
            lastOnlineSync: Date.now(),
          });

          // Update user cookie for middleware access
          await updateUserCookie();
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ loading: false });
        }
      },

      signUp: async (data) => {
        try {
          set({ loading: true, error: null });

          const response = await signUp.email({
            email: data.email,
            password: data.password,
            name: data.name,
            phone: data.phone,
            callbackURL: data.callbackUrl || ROUTES.home
          });

          if (response.error) {
            throw new Error(response.error.message);
          }
          const user = await getUserById(response.data.user.id);

          set({
            authUser: await getUser(),
            user: user,
            lastOnlineSync: Date.now(),
          });

          // Update user cookie for middleware access
          await updateUserCookie();
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      signInWithGoogle: async (redirectUrl?: string) => {
        try {
          set({ loading: true, error: null });

          const { error, data } = await signIn.social({
            provider: 'google',
            callbackURL: redirectUrl || ROUTES.home,
          });

          if (error) {
            throw new Error(error.message);
          }

          const authUser = await getUser();

          if (!authUser) {
            throw new Error('Failed to get user');
          }
          const user = await getUserById(authUser?.id);

          set({
            authUser: authUser,
            user: user,
            lastOnlineSync: Date.now(),
          });

          // Update user cookie for middleware access
          await updateUserCookie();
        } catch (error: any) {
          console.error('Google sign-in error:', error);
          set({ error: error.message || 'Unexpected error occurred' });
          set({ loading: false });
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        try {
          set({ loading: true, error: null });
          await signOut();
          
          // Clear user cookie on logout
          await clearUserCookie();
          
          set({
            authUser: null,
            user: null,
           });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ loading: false });
        }
      },

      isAuthenticated: () => {
        const { authUser, lastOnlineSync } = get();

        if (navigator.onLine) {
          return !!(authUser);
        }

        if (!navigator.onLine && authUser && lastOnlineSync) {
          const offlineValidityPeriod = 24 * 60 * 60 * 1000;
          const isStillValid = Date.now() - lastOnlineSync < offlineValidityPeriod;
          return isStillValid;
        }

        return false;
      },

    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        authUser: state.authUser,
        user: state.user,
        lastOnlineSync: state.lastOnlineSync,
      }),
    }
  )
);