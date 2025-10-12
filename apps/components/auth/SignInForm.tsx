'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { GoogleIcon } from './components/Google'
import { useRouter } from 'next/navigation'
import { AuthCard } from './AuthCard'
import { useAuthStore } from '@/hooks/auth-store'
import { ROUTES } from '@/lib/router'
import { signInSchema, SignInSchemaType } from '@/lib/validation/user'
import { useT } from '@/hooks/use-inline-translation'


interface SignInFormProps {
  onToggleForm(): void
  redirectTo?: string
}

export function SignInForm({ onToggleForm, redirectTo }: SignInFormProps) {
  const t = useT()

  const router = useRouter()
  const { toast } = useToast()
  const { signIn, signInWithGoogle, loading, error } = useAuthStore()

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
      toast({
        title: t("Welcome back!"),
        description: t("You have successfully logged in"),
      })
      router.replace(redirectTo || ROUTES.home)
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
      await signInWithGoogle()
      toast({
        title: t("Welcome!"),
        description: t("You have successfully signed in with Google"),
      })
      router.replace(redirectTo || ROUTES.home)
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
