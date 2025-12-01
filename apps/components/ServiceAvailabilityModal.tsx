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
    await requestLocation();
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
