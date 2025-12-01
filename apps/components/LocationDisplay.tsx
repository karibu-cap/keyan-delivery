'use client';

import { useEffect, useState } from 'react';
import { useLocationStore } from '@/hooks/use-location-store';
import { getDistanceFromMigori } from '@/lib/utils/location';
import { MapPin } from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';

export function LocationDisplay() {
  console.log('📍 LocationDisplay component rendered');
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
    console.log('📍 LocationDisplay mounted - checking permission status');
    checkPermissionStatus();
  }, [checkPermissionStatus]);

  // Calculate distance when location changes and user is outside Migori
  useEffect(() => {
    console.log('📏 Distance calculation effect triggered:', { currentLocation, isInMigoriZone });
    
    if (currentLocation && !isInMigoriZone) {
      console.log('📏 Calculating distance from Migori...');
      getDistanceFromMigori(currentLocation)
        .then(dist => {
          console.log('📏 Distance calculated:', dist, 'km');
          setDistance(Math.round(dist));
        })
        .catch((error) => {
          console.error('📏 Error calculating distance:', error);
          setDistance(null);
        });
    } else {
      console.log('📏 Not calculating distance - conditions not met');
      setDistance(null);
    }
  }, [currentLocation, isInMigoriZone]);

  console.log('📍 LocationDisplay - State values:', {
    currentLocation,
    isInMigoriZone,
    hasLocationPermission,
    distance,
    willShowDistance: distance !== null && !isInMigoriZone && currentLocation && hasLocationPermission !== false
  });

  // If no location permission or location not available
  if (hasLocationPermission === false || !currentLocation) {
    console.log('📍 Showing: No permission or no location');
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
    console.log('📍 Showing: In Migori zone');
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
  console.log('📍 Showing: Distance display');
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
