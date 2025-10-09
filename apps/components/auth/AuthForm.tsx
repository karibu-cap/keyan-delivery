"use client"
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ResetPasswordForm } from './ResetPasswordForm'
import { SignInForm } from './SignInForm'
import { SignUpForm } from './SignUpForm'
import { useAuthStore } from '@/hooks/auth-store'

interface AuthFormProps {
  isLogin: boolean
  isResetting: boolean
}

export function AuthForm(props: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(props.isLogin)
  const [isResetting, setIsResetting] = useState(props.isResetting)
  const { error, setError, setLoading } = useAuthStore()

  const toggleForm = (value: boolean) => {
    setIsLogin(value)
    setIsResetting(false)
  }

  const toggleResetPassword = () => {
    setIsResetting(!isResetting)
  }

  return (
    <div className="flex flex-col max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
          >
            <Alert variant="destructive" className='bg-red-500'>
              <div className="flex items-center gap-2 justify-center">
                <AlertCircle className="h-4 w-4 text-white" />
                <AlertDescription className="text-white">{error}</AlertDescription>
              </div>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        {isResetting ? (
          <ResetPasswordForm onBack={toggleResetPassword} />
        ) : isLogin ? (
          <SignInForm
            onToggleForm={() => { toggleForm(false); setError(null); setLoading(false); }}
            onForgotPassword={toggleResetPassword}
          />
        ) : (
          <SignUpForm onToggleForm={() => { toggleForm(true); setError(null); setLoading(false); }} />
        )}
      </AnimatePresence>
    </div>
  )
}
