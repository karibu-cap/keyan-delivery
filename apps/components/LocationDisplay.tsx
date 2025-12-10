'use client';

import { useT } from '@/hooks/use-inline-translation';
import { useLocationStore } from '@/hooks/use-location-store';
import { getDistanceFromMigori } from '@/lib/utils/location';
import { MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

export function LocationDisplay() {
  const [distance, setDistance] = useState<number | null>(null);
  
  const {
    isInMigoriZone,
    hasLocationPermission,
    currentLocation,
    checkPermissionStatus,
  } = useLocationStore();

  const t = useT();

  // Check permission status immediately on mount
  useEffect(() => {
    checkPermissionStatus();
  }, [checkPermissionStatus]);

  // Calculate distance when location changes and user is outside Migori
  useEffect(() => {
    
    if (currentLocation && !isInMigoriZone) {
      getDistanceFromMigori(currentLocation)
        .then(dist => {
          setDistance(Math.round(dist));
        })
        .catch((error) => {
          setDistance(null);
        });
    } else {
      setDistance(null);
    }
  }, [currentLocation, isInMigoriZone]);

  // If no location permission or location not available
  if (hasLocationPermission === false || !currentLocation) {
    return (
      <div className="flex gap-2 text-black px-4 py-2 pb-10">
        <MapPin className="w-5 h-5 text-black" />
        <span className="font-semibold text-sm uppercase drop-shadow-lg underline">
          {t('Application only  available in  migori')}
        </span>
      </div>
    );
  }

  // If in Migori zone
  if (isInMigoriZone) {
    return (
      <div className="flex gap-2 text-black px-4 py-2 pb-10">
        <MapPin className="w-5 h-5 text-black" />
        <span className="font-semibold text-sm uppercase drop-shadow-lg underline">
          {t('You are in migori')}
        </span>
      </div>
    );
  }

  // If outside Migori zone but has location - show distance
  return (
    <div className="flex gap-2 text-black px-4 py-2 pb-10">
      <MapPin className="w-5 h-5 text-black" />
      <span className="font-semibold text-sm uppercase drop-shadow-lg underline">
        {distance !== null 
          ? `${t('Your location: ')} ${distance} km ${t('from migori town')}`
          : t('calculating-distance')}
      </span>
    </div>
  );
}
