import { getAuthErrorMessage } from '@/lib/firebase-client/auth-error'
import { auth } from '@/lib/firebase-client/firebase'
import { User, UserRole } from '@prisma/client'
import {
  AuthError,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'



interface SignUpData {
  email: string
  password: string
  fullName: string
  role: UserRole
  phone?: string
  cni?: string
  driverDocument?: string
}

interface AuthState {
  user: Partial<User> | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (data:  SignUpData) => Promise<void>
  signInWithGoogle: (data:  SignUpData) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const useAuthStore = create(
  persist<AuthState>(
    (set, get) => ({
      user: get()?.user || null,
      loading: false,
      error: null,
      setUser: user => set({ user }),
      setLoading: loading => set({ loading }),
      setError: error => set({ error }),
      signIn: async (email, password) => {
        try {
          set({ loading: true, error: null })
          const userCredential = await signInWithEmailAndPassword(auth, email, password)
          const idToken = await userCredential.user.getIdToken()

          await fetch('/api/login', {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          })

          set({ user: userCredential.user })
        } catch (error) {
          const authError = error as AuthError
          set({ error: getAuthErrorMessage(authError.code), loading: false })
          throw error
        }
      },

      signUp: async (data: SignUpData) => {
        try {
          set({ loading: true, error: null })

          // Validate role-specific requirements
          if (data.role === UserRole.driver && (!data.cni || !data.driverDocument)) {
            set({
              error: 'CNI and driver document are required for driver registration',
              loading: false,
            })
            return
          }

          const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)

          // Update Firebase profile
          await updateProfile(userCredential.user, {
            displayName: data.fullName,
          })

          const userData: Partial<User> = {
            email: data.email,
            authId: userCredential.user.uid,
            fullName: data.fullName,
            phone: data.phone || null,
            roles: data.role ? [data.role] : [UserRole.customer],
            cni: data.cni || null,
            driverDocument: data.driverDocument || null,
          }

          const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          })

          if (!response.ok) {
            set({
              error: getAuthErrorMessage('auth/failed-to-add-user'),
              loading: false,
            })
            return
          }

          await sendEmailVerification(userCredential.user)
          set({ user: userCredential.user, error: null, loading: false })
        } catch (error) {
          const authError = error as AuthError
          set({ error: getAuthErrorMessage(authError.code), loading: false })
          throw error
        }
      },

      signInWithGoogle: async (data:  SignUpData) => {
        try {
          set({ loading: true, error: null })
          const provider = new GoogleAuthProvider()
          const userCredential = await signInWithPopup(auth, provider)

          // Create or update user in database using Prisma API (default to customer role for Google sign-in)
          const userData = {
            email: userCredential.user.email || '',
            userId: userCredential.user.uid,
            fullName: userCredential.user.displayName,
            avatar: userCredential.user.photoURL,
            roles: data.role ? [data.role] : [UserRole.customer],
            cni: data.cni || null,
            driverDocument: data.driverDocument || null,
          }

          const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          })

          if (!response.ok) {
            set({
              error: getAuthErrorMessage('auth/failed-to-add-user'),
              loading: false,
            })
            return
          }
          const idToken = await userCredential.user.getIdToken()

          await fetch('/api/login', {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          })
          set({ user: userCredential.user, loading: false })
        } catch (error) {
          const authError = error as AuthError
          set({ error: getAuthErrorMessage(authError.code), loading: false })
          throw error
        }
      },

      resetPassword: async email => {
        try {
          set({ loading: true, error: null })
          await sendPasswordResetEmail(auth, email)
        } catch (error) {
          const authError = error as AuthError
          set({ error: getAuthErrorMessage(authError.code) })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      logout: async () => {
        try {
          set({ loading: true, error: null })
          await signOut(auth)
          await fetch('/api/logout')
          set({ user: null })
        } catch (error) {
          const authError = error as AuthError
          set({ error: getAuthErrorMessage(authError.code) })
          throw error
        } finally {
          set({ loading: false })
        }
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
export { useAuthStore }
