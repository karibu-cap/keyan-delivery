'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'
import { BarChart, Car, Icon, Loader2, Package, Shield, Store } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { UserRole } from '@prisma/client'


interface SignUpFormProps {
  onToggleForm(): void
}

export function SignUpForm({ onToggleForm }: SignUpFormProps) {
  const { toast } = useToast()
  const { signUp, signInWithGoogle, loading, error } = useAuthStore()

  const form = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
      cni: undefined,
      driverDocument: undefined,
      role: 'customer',
    },
  })

  const selectedRole = form.watch('role')

  const onSubmit = async (data: SignUpSchemaType) => {
    try {
      // Validate driver-specific fields
      if (data.role === 'driver') {
        if (!data.cni) {
          form.setError('cni', {
            type: 'manual',
            message: 'CNI is required for drivers',
          })
          return
        }
        if (!data.driverDocument) {
          form.setError('driverDocument', {
            type: 'manual',
            message: 'Driver license is required for drivers',
          })
          return
        }
      }

      // Handle file uploads for drivers
      let cniFileName: string | undefined
      let driverDocumentFileName: string | undefined

      if (data.role === 'driver' && data.cni && data.driverDocument) {
        try {
          // Create FormData for file uploads to media endpoint
          const formData = new FormData()
          formData.append('files', data.cni)
          formData.append('files', data.driverDocument)

          // Upload files and get back media URLs
          const uploadResponse = await fetch('/api/media/upload', {
            method: 'POST',
            body: formData,
          })

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json()
            const uploadedFiles = uploadResult.data.files

            // Assign URLs to respective fields (first file is CNI, second is driver document)
            cniFileName = uploadedFiles[0]?.url
            driverDocumentFileName = uploadedFiles[1]?.url
          } else {
            throw new Error('Failed to upload documents')
          }
        } catch (uploadError) {
          console.error('File upload error:', uploadError)
          form.setError('root', {
            type: 'manual',
            message: 'Failed to upload documents. Please try again.',
          })
          return
        }
      } else {
        // For non-drivers or when files aren't provided, use file names if available
        cniFileName = data.cni?.name
        driverDocumentFileName = data.driverDocument?.name
      }
      await signUp({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
        cni: cniFileName,
        phone: data.phone,
        driverDocument: driverDocumentFileName,
      })
      toast({
        title: 'Account created',
        description: 'Please verify your email address',
      })
      onToggleForm()
    } catch (err) {
      console.error(err)
      form.setError('root', {
        type: 'manual',
        message: error || 'An unexpected error occurred',
      })
    }
  }

  const handleGoogleSignIn = async (data: SignUpSchemaType) => {
    try {
      await signInWithGoogle({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
      })
      toast({
        title: 'Welcome!',
        description: 'You have successfully signed in with Google',
      })
      onToggleForm()
    } catch (err) {
      form.setError('root', {
        type: 'manual',
        message: error || 'An unexpected error occurred',
      })
    }
  }

  return (
    <AuthCard title="Create Account" description="Sign up for a new account">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
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
          </div>

          {/* Conditional fields for drivers */}
          {selectedRole === 'driver' && (
            <>
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="cni"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>CNI (National ID Card) *</FormLabel>
                      <FormControl>
                        <Input
                          {...fieldProps}
                          type="file"
                          accept="image/*"
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            onChange(file)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="driverDocument"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Driver Document *</FormLabel>
                      <FormControl>
                        <Input
                          {...fieldProps}
                          type="file"
                          accept="image/*"
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            onChange(file)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
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
          </div>
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>I am a *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="I am a *" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UserRole.customer}><div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Customer
                      </div></SelectItem>
                      <SelectItem value={UserRole.merchant}><div className="flex items-center gap-2">
                        <Store className="w-4 h-4" />
                        Merchant
                      </div></SelectItem>
                      <SelectItem value={UserRole.driver}><div className="flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        Driver
                      </div></SelectItem>
                      <SelectItem value={UserRole.business_manager}><div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Business Manager
                      </div></SelectItem>
                      <SelectItem value={UserRole.super_admin}><div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Super Admin
                      </div></SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} type='email' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your password" {...field} type='password' required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign Up'}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={form.handleSubmit(handleGoogleSignIn)}
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
            Already have an account? Sign In, Sign-In
          </Button>
        </motion.div>
      </div>
    </AuthCard>
  )
}
