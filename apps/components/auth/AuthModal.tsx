'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuthStore } from '@/hooks/use-auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState, createContext, useContext } from 'react';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { AlertCircle } from 'lucide-react';

const AuthModalContext = createContext<{
    openModal: (redirectTo?: string, mode?: 'signin' | 'signup') => void;
} | null>(null);

export const useAuthModal = () => {
    const context = useContext(AuthModalContext);
    if (!context) {
        throw new Error('useAuthModal must be used within an AuthModalProvider');
    }
    return context;
};

interface AuthModalProps {
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    redirectTo?: string;
    mode?: 'signin' | 'signup';
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        redirectTo?: string;
        mode: 'signin' | 'signup';
    }>({ isOpen: false, mode: 'signin' });

    const openModal = (redirectTo?: string, mode: 'signin' | 'signup' = 'signin') => {
        setModalState({ isOpen: true, redirectTo, mode });
    };

    const { refreshSession } = useAuthStore();

    useEffect(() => {
        refreshSession();
    }, []);

    return (
        <AuthModalContext.Provider value={{ openModal }}>
            {children}
            <AuthModal
                open={modalState.isOpen}
                onOpenChange={(isOpen) => setModalState(prev => ({ ...prev, isOpen }))}
                redirectTo={modalState.redirectTo}
                mode={modalState.mode}
            />
        </AuthModalContext.Provider>
    );
}

export function AuthModal({
    children,
    open,
    onOpenChange,
    redirectTo,
    mode = 'signin'
}: AuthModalProps) {
    const [isSignIn, setIsSignIn] = useState(mode === 'signin');
    const [isOpen, setIsOpen] = useState(open || false);
    const { authUser, isAuthenticated, setError, setLoading, error } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (authUser && isAuthenticated() && redirectTo) {
            handleClose();
            router.push(redirectTo);
        }
    }, [authUser, redirectTo]);

    useEffect(() => {
        if (open !== undefined) {
            setIsOpen(open);
        }
    }, [open]);

    const handleToggleForm = () => {
        setIsSignIn(!isSignIn);
        setError(null);
    };

    const handleClose = () => {
        setIsOpen(false);
        onOpenChange?.(false);
        setIsSignIn(mode === 'signin');
        setError(null);
        setLoading(false);
    };

    const handleSuccess = () => {
        if (redirectTo) {
            handleClose();
            // router.push(redirectTo);
        } else {
            handleClose();
        }
    };

    return (
        <Dialog
            open={open !== undefined ? open : isOpen}
            onOpenChange={(newOpen) => {
                if (newOpen) {
                    setIsOpen(newOpen);
                    onOpenChange?.(newOpen);
                } else {
                    handleClose();
                }
            }}
        >
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="sm:max-w-md p-0 bg-transparent border-0 shadow-none">
                <DialogHeader>
                    <DialogTitle></DialogTitle>
                    <DialogDescription>
                    </DialogDescription>
                </DialogHeader>
                {isSignIn ? (
                    <SignInForm
                        onToggleForm={handleToggleForm}
                        onSuccess={handleSuccess}
                        redirectUrl={redirectTo}
                    />
                ) : (
                    <SignUpForm
                        onToggleForm={handleToggleForm}
                        onSuccess={handleSuccess}
                        redirectUrl={redirectTo}
                    />
                )}
                {error && <Alert variant="destructive" className='bg-red-500'>
                    <div className="flex items-center gap-2 justify-center">
                        <AlertCircle className="h-4 w-4 text-white" />
                        <AlertDescription className="text-white">{error}</AlertDescription>
                    </div>
                </Alert>}
            </DialogContent>
        </Dialog>
    );


}