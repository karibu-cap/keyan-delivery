'use client'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/hooks/use-auth-store'
import { useT } from '@/hooks/use-inline-translation'
import { useToast } from '@/hooks/use-toast'
import { signInSchema, SignInSchemaType } from '@/lib/validation/user'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { AuthCard } from './AuthCard'
import { GoogleIcon } from './components/Google'


interface SignInFormProps {
  onToggleForm(): void
  onSuccess?: () => void
  redirectUrl?: string
}

export function SignInForm({ onToggleForm, onSuccess, redirectUrl }: SignInFormProps) {
  const t = useT()

  const { toast } = useToast()
  const { signIn, signInWithGoogle, loading, error, isAuthenticated } = useAuthStore()

  const form = useForm<SignInSchemaType>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: SignInSchemaType) => {

    try {
      await signIn(data.email, data.password)
      if (isAuthenticated()) {
        onSuccess?.()
      }
    } catch (err) {
      console.error(err)
      form.setError('root', {
        type: 'manual',
        message: error || t("An unexpected error occurred"),
      })
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle(redirectUrl)
      if (isAuthenticated()) {
        onSuccess?.()
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <AuthCard title={t("Welcome Back")} description={t("Sign in to your account")}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Email")}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder={t("Enter your email")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Password")}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder={t("Enter your password")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t("Sign In")}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <GoogleIcon className="mr-2 h-4 w-4" />
              {t("Continue with Google")}
            </Button>
          </div>
        </form>
      </Form>

      <div className="text-center space-y-2">
        <motion.div whileHover={{ scale: 1.05 }}>
          <Button variant="link" onClick={onToggleForm}>
            {t("Don't have an account? Sign Up")}
          </Button>
        </motion.div>
      </div>
    </AuthCard>
  )
}
