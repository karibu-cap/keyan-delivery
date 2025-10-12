'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { AuthCard } from '@/components/auth/AuthCard'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/router'
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth'
import { auth } from '@/lib/firebase-client/firebase'
import { useT } from '@/hooks/use-inline-translation'
interface NewPasswordFormProps {
  token: string
}

export const NewPasswordForm = ({ token }: NewPasswordFormProps) => {
  const t = useT()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: t("Error"),
        description: t("Passwords do not match"),
      })
      return
    }

    try {
      setLoading(true)
      await verifyPasswordResetCode(auth, token)
      await confirmPasswordReset(auth, token, password)

      toast({
        title: t("Success"),
        description: t("Password successfully reset! You can now login."),
      })
      router.push(ROUTES.signIn)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t("Error"),
        description: t("Failed to reset password. The link may be expired or invalid."),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title={t("Set New Password")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="password"
            placeholder={t("New Password")}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <Input
            type="password"
            placeholder={t("Confirm New Password")}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("Resetting...") : t("Reset Password")}
        </Button>
        <div className="text-center">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push(ROUTES.signIn)}
            className="text-sm text-muted-foreground/80 hover:text-muted-foreground"
          >
            {t("Back to Login")}
          </motion.button>
        </div>
      </form>
    </AuthCard>
  )
}
