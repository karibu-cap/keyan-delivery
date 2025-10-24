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
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { AuthCard } from './AuthCard'

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type FormData = z.infer<typeof formSchema>

interface ResetPasswordFormProps {
  onBack(): void
}

export function ResetPasswordForm({ onBack }: ResetPasswordFormProps) {
  const { toast } = useToast()
  const {  loading, error } = useAuthStore()
  const t = useT()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // await resetPassword(data.email)
      toast({
        title: t("Password reset email sent"),
        description: t("Check your email for further instructions"),
      })
      onBack()
    } catch (err) {
      form.setError('root', {
        type: 'manual',
        message: error || t("An unexpected error occurred"),
      })
    }
  }

  return (
    <AuthCard title={t("Reset Password")} description={t("Enter your email to reset your password")}>
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

          <div className="space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t("Send Reset Link")}
            </Button>
          </div>
        </form>
      </Form>

      <div className="text-center">
        <Button variant="link" onClick={onBack}>
          {t("Back to login")}
        </Button>
      </div>
    </AuthCard>
  )
}
