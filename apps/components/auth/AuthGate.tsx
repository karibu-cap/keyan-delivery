'use client';

import { useAuthStore } from '@/hooks/use-auth-store';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthModal } from './AuthModal';

interface AuthGateProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

export function AuthGate({ 
  children, 
  requireAuth = false,
  fallback 
}: AuthGateProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated, refreshSession } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    if (requireAuth) {
      const checkAuth = async () => {
        await refreshSession();
        
        if (!isAuthenticated()) {
          setShowAuthModal(true);
        }
      };

      checkAuth();
    }
  }, [requireAuth]);

  // If auth is required and user is not authenticated
  if (requireAuth && !isAuthenticated()) {
    return (
      <>
        {fallback || (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-4">
                Please sign in to access this content
              </p>
            </div>
          </div>
        )}
        <AuthModal 
          open={showAuthModal} 
          onOpenChange={setShowAuthModal}
          redirectTo={pathname}
        >
          <div />
        </AuthModal>
      </>
    );
  }

  return <>{children}</>;
}