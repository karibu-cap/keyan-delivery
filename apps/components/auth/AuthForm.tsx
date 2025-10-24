"use client"
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuthStore } from '@/hooks/use-auth-store'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { ResetPasswordForm } from './ResetPasswordForm'
import { SignInForm } from './SignInForm'
import { SignUpForm } from './SignUpForm'

interface AuthFormProps {
  isLogin: boolean
  isResetting: boolean
  redirect?: string
}

export function AuthForm(props: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(props.isLogin)
  const [isResetting, setIsResetting] = useState(props.isResetting)
  const { error, setError, setLoading } = useAuthStore()
  // const router = useRouter();

  const toggleForm = (value: boolean) => {
    setIsLogin(value)
    setIsResetting(false)
  }

  const toggleResetPassword = () => {
    setIsResetting(!isResetting)
  }

  // const onSuccess = () => {
  //   router.push(props.redirect || '/');
  // }

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
            redirectUrl={props.redirect}
          />
        ) : (
          <SignUpForm onToggleForm={() => { toggleForm(true); setError(null); setLoading(false); }} redirectUrl={props.redirect} />
        )}
      </AnimatePresence>
    </div>
  )
}
