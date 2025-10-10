'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from '@/components/ui/dialog'
import { SignInForm } from './SignInForm'
import { SignUpForm } from './SignUpForm'

interface AuthModalProps {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function AuthModal({ children, open, onOpenChange }: AuthModalProps) {
    const [isSignIn, setIsSignIn] = useState(true)
    const [isOpen, setIsOpen] = useState(false)

    const handleToggleForm = () => {
        setIsSignIn(!isSignIn)
    }

    const handleOpenChange = (newOpen: boolean) => {
        setIsOpen(newOpen)
        if (!newOpen) {
            setIsSignIn(true) // Reset to sign in form when closing
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
                    />
                ) : (
                    <SignUpForm onToggleForm={handleToggleForm} />
                )}
            </DialogContent>
        </Dialog>
    )
}