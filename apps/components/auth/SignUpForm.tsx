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
import { signUpSchema, SignUpSchemaType } from '@/lib/validation/user'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserRole } from '@prisma/client'
import { motion } from 'framer-motion'
import { Loader2, Package } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { AuthCard } from './AuthCard'
import { GoogleIcon } from './components/Google'

interface SignUpFormProps {
  onToggleForm(): void
  onSuccess?: () => void
  redirectUrl?: string
}

const roleOptions = [
  {
    value: UserRole.customer,
    label: 'Customer',
    icon: Package,
    description: 'Order products and services'
  },
]

export function SignUpForm({ onToggleForm, onSuccess, redirectUrl }: SignUpFormProps) {
  const t = useT()

  const { toast } = useToast()
  const { signUp, signInWithGoogle, loading, error } = useAuthStore()
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.customer)

  const form = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
    },
  })

  const onSubmit = async (data: SignUpSchemaType) => {
    try {
      await signUp({
        ...data,
      }, redirectUrl)
      toast({
        title: t("Account created"),
        description: t("Welcome! Your account has been created successfully."),
      })
      onSuccess?.()
    } catch (err) {
      console.error({ message: err })
      form.setError('root', {
        type: 'manual',
        message: error || t("An unexpected error occurred"),
      })
    }
  }

  const handleGoogleSignIn = async () => {
    await signInWithGoogle(redirectUrl)
    toast({
      title: t("Welcome!"),
      description: t("You have successfully signed in with Google"),
    })
    onSuccess?.()
  }

  return (
    <AuthCard title={t("Create Account")} description={t("Join our platform today")}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-3">
            <FormLabel>Account Type</FormLabel>
            <div className="grid grid-cols-1 gap-3">
              {roleOptions.map((role) => {
                const Icon = role.icon
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={`p-4 border-2 rounded-lg transition-all ${selectedRole === role.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">{role.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {role.description}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("Want to become a merchant or driver? You can apply after creating your account.")}
            </p>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Full Name *")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("Enter your name")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Phone Number")}</FormLabel>
                <FormControl>
                  <Input placeholder="+1 234 567 8900" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Email *")}</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} type="email" />
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
                <FormLabel>{t("Password *")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Enter your password")}
                    {...field}
                    type="password"
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t("Sign Up")}
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

      <div className="text-center">
        <motion.div whileHover={{ scale: 1.05 }}>
          <Button variant="link" onClick={onToggleForm}>
            {t("Already have an account? Sign In")}
          </Button>
        </motion.div>
      </div>
    </AuthCard>
  )
}