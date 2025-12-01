'use client';

import { useEffect, useState } from 'react';
import { useLocationStore } from '@/hooks/use-location-store';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useT } from '@/hooks/use-inline-translation';
import { toast } from '@/hooks/use-toast';

export function ServiceAvailabilityModal() {
  const t = useT();
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    hasSeenModal,
    setHasSeenModal,
    requestLocation,
    isLoading,
    hasLocationPermission,
    currentLocation,
    checkPermissionStatus,
  } = useLocationStore();

  // Check real permission status on mount
  useEffect(() => {
    checkPermissionStatus();
  }, [checkPermissionStatus]);

  useEffect(() => {
    // Show modal only if user hasn't seen it before
    // Note: On HTTP localhost, Firefox doesn't persist permissions,
    // so we only show once to avoid annoying the user
    console.log('🎭 Modal useEffect - State:', {
      hasSeenModal,
      hasLocationPermission,
      currentLocation,
      isLoading
    });

    const shouldShowModal = !hasSeenModal && !hasLocationPermission;

    if (shouldShowModal) {
      console.log('🎭 Opening modal - first visit or no permission');
      setIsOpen(true);
    } else if (hasLocationPermission) {
      console.log('🎭 Closing modal - permission granted');
      setHasSeenModal(true);
      setIsOpen(false);
    } else {
      console.log('🎭 Not opening modal - already seen or permission already granted');
    }
  }, [hasSeenModal, hasLocationPermission, currentLocation, isLoading]);

  const handleShareLocation = async () => {
    console.log('🔘 Share location button clicked');
    try {
      await requestLocation();
      // Modal will close automatically via useEffect when hasLocationPermission becomes true
    } catch (error) {
      console.error('❌ Location request failed in modal:', error);
      // Close modal but don't mark as seen so user can try again later
      setIsOpen(false);
      
      // Show detailed error message to user via toast
      toast({
        variant: 'destructive',
        title: t('Location access blocked'),
        duration: Infinity,
        description: (
          <div className="space-y-2 text-sm">
            <p>{t('We need your location to show you nearby stores and calculate delivery times')}</p>
            <div className="mt-3">
              <p className="font-semibold">{t('To enable location access')}</p>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>{t('Click the lock icon in your browser address bar')}</li>
                <li>{t('Find location permissions')}</li>
                <li>{t('Change it to allow')}</li>
                <li>{t('Refresh the page')}</li>
              </ol>
            </div>
            <p className="text-xs mt-3 opacity-80">{t('You can also enable it in your browser settings under privacy security')}</p>
          </div>
        ),
      });
    }
  };

  const handleClose = () => {
    setHasSeenModal(true);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-green-100 via-green-200 to-green-500 text-black border-none">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-black">
            {t('Service availability notice')}
          </DialogTitle>
          <DialogDescription className="text-black/90 space-y-4 pt-4">
            <p className="text-base">
              {t('Our services are currently available only in migori and nearby areas')}
            </p>
            <p className="text-base">
              {t('if you are in migori please allow us to access your location so we can show you nearby stores')}
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-4">
          <Button
            onClick={handleShareLocation}
            disabled={isLoading}
            className="bg-green-700 hover:bg-green-800 text-white font-semibold py-6 text-base"
          >
            {isLoading ? t('getting location') : t('share location')}
          </Button>

          <p className="text-sm text-black/80 text-center">
            {t('if you are not in migori unfortunately you wont be able to use the app at this time')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
