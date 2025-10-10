'use client'

import { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from '@/components/ui/dialog'
import { SignInForm } from './SignInForm'
import { SignUpForm } from './SignUpForm'
import { useAuthStore } from '@/hooks/auth-store'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/router'

interface AuthModalProps {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    redirectTo?: string
}

export function AuthModal({ children, open, onOpenChange, redirectTo }: AuthModalProps) {
    const [isSignIn, setIsSignIn] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const { user } = useAuthStore();
    const route = useRouter()
    const redirectPath = redirectTo ?? ROUTES.home

    const handleToggleForm = () => {
        setIsSignIn(!isSignIn)
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (user && redirectTo) {
            route.push(redirectTo)
            return
        }
        setIsOpen(newOpen)
        if (!newOpen) {
            setIsSignIn(true)
        }
        onOpenChange?.(newOpen)
    }

    return (
        <Dialog open={open !== undefined ? open : isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0 bg-transparent border-0 shadow-none">
                {isSignIn ? (
                    <SignInForm
                        onToggleForm={handleToggleForm}
                        redirectTo={redirectPath}
                    />
                ) : (
                    <SignUpForm onToggleForm={handleToggleForm} redirectTo={redirectPath} />
                )}
            </DialogContent>
        </Dialog>
    )
}