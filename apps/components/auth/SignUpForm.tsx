'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Loader2, Package } from 'lucide-react'
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
import { AuthCard } from './AuthCard'
import { useAuthStore } from '@/hooks/auth-store'
import { signUpSchema, SignUpSchemaType } from '@/lib/validation/user'
import { UserRole } from '@prisma/client'
import { useState } from 'react'
import { ROUTES } from '@/lib/router'
import { useRouter } from 'next/navigation'

interface SignUpFormProps {
  onToggleForm(): void
  redirectTo?: string
}

const roleOptions = [
  {
    value: UserRole.customer,
    label: 'Customer',
    icon: Package,
    description: 'Order products and services'
  },
]

export function SignUpForm({ onToggleForm, redirectTo }: SignUpFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const { signUp, signInWithGoogle, loading, error } = useAuthStore()
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.customer)

  const form = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
      role: UserRole.customer,
    },
  })

  const onSubmit = async (data: SignUpSchemaType) => {
    try {
      await signUp({
        ...data,
        role: selectedRole,
        cni: '',
        driverDocument: '',
      })
      toast({
        title: 'Account created',
        description: 'Welcome! Your account has been created successfully.',
      })
      router.replace(redirectTo || ROUTES.home)
    } catch (err) {
      console.error(err)
      form.setError('root', {
        type: 'manual',
        message: error || 'An unexpected error occurred',
      })
    }
  }

  const handleGoogleSignIn = async () => {
    await signInWithGoogle()
    toast({
      title: 'Welcome!',
      description: 'You have successfully signed in with Google',
    })
    router.replace(redirectTo || ROUTES.home)
  }

  return (
    <AuthCard title="Create Account" description="Join our platform today">
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
              Want to become a merchant or driver? You can apply after creating your account.
            </p>
          </div>

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name" {...field} />
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
                <FormLabel>Phone Number *</FormLabel>
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
                <FormLabel>Email *</FormLabel>
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
                <FormLabel>Password *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your password"
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
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign Up'}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <GoogleIcon className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
          </div>
        </form>
      </Form>

      <div className="text-center">
        <motion.div whileHover={{ scale: 1.05 }}>
          <Button variant="link" onClick={onToggleForm}>
            Already have an account? Sign In
          </Button>
        </motion.div>
      </div>
    </AuthCard>
  )
}