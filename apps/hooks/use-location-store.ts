'use client';

import { isInMigoriZone } from '@/lib/utils/location';
import { reverseGeocode } from '@/lib/utils/client/geo_coding';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationState {
  currentLocation: Coordinates | null;
  userCity: string | null;
  isInMigoriZone: boolean;
  hasLocationPermission: boolean | null;
  isLoading: boolean;
  error: string | null;
  hasSeenModal: boolean;

  // Actions
  setCurrentLocation: (location: Coordinates | null) => void;
  setUserCity: (city: string | null) => void;
  setIsInMigoriZone: (isInZone: boolean) => void;
  setHasLocationPermission: (hasPermission: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setHasSeenModal: (hasSeen: boolean) => void;
  checkPermissionStatus: () => Promise<void>;
  requestLocation: () => Promise<void>;
  startLocationTracking: () => void;
  stopLocationTracking: () => void;
}

let watchId: number | null = null;

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      currentLocation: null,
      userCity: null,
      isInMigoriZone: false,
      hasLocationPermission: null,
      isLoading: false,
      error: null,
      hasSeenModal: false,

      setCurrentLocation: (location) => set({ currentLocation: location }),
      setUserCity: (city) => set({ userCity: city }),
      setIsInMigoriZone: (isInZone) => set({ isInMigoriZone: isInZone }),
      setHasLocationPermission: (hasPermission) => set({ hasLocationPermission: hasPermission }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setHasSeenModal: (hasSeen) => set({ hasSeenModal: hasSeen }),

      checkPermissionStatus: async () => {
        console.log('🔍 Checking geolocation permission status...');
        
        if (!navigator.permissions) {
          console.log('⚠️ Permissions API not supported');
          return;
        }

        try {
          const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          console.log('📝 Permission state:', result.state);
          
          const currentState = get().hasLocationPermission;
          
          if (result.state === 'granted') {
            console.log('✅ Permission already granted');
            set({ hasLocationPermission: true });
            // If permission is granted and we don't have current location, get it
            if (!get().currentLocation) {
              console.log('🔄 Auto-retrieving location since permission is granted');
              get().requestLocation();
            }
          } else if (result.state === 'denied') {
            console.log('🚫 Permission denied in browser settings');
            if (currentState !== false) {
              set({ hasLocationPermission: false });
            }
          } else {
            console.log('❓ Permission prompt (not yet decided) - state:', result.state);
            // Only set to null if we don't already have a definitive answer
            if (currentState === null) {
              set({ hasLocationPermission: null });
            }
          }

          // Listen for permission changes
          result.addEventListener('change', () => {
            console.log('🔄 Permission changed to:', result.state);
            if (result.state === 'granted') {
              set({ hasLocationPermission: true });
            } else if (result.state === 'denied') {
              set({ hasLocationPermission: false });
            } else {
              set({ hasLocationPermission: null });
            }
          });
        } catch (error) {
          console.error('❌ Error checking permission:', error);
        }
      },

      requestLocation: async () => {
        console.log('🚀 requestLocation function called');
        
        if (!navigator.geolocation) {
          console.error('❌ Geolocation not supported');
          set({ 
            error: 'Geolocation is not supported by your browser',
            hasLocationPermission: false,
            isLoading: false
          });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          console.log('📍 Requesting geolocation permission...');
          
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve,
              reject,
              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
              }
            );
          });

          const coords: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          console.log('✅ Coordinates retrieved:', coords);
          
          set({
            currentLocation: coords,
            hasLocationPermission: true,
            isLoading: false,
          });

          // Check if in Migori zone
          const inZone = isInMigoriZone(coords);
          console.log('🎯 Is in Migori zone:', inZone);
          set({ isInMigoriZone: inZone });

          // Get city name via reverse geocoding
          try {
            console.log('🌍 Getting city name via reverse geocoding...');
            const geoData = await reverseGeocode(coords.latitude, coords.longitude);
            const cityName = geoData.city || 'your area';
            console.log('🏙️ City detected:', cityName);
            set({ userCity: cityName });
          } catch (error) {
            console.error('❌ Error getting city name:', error);
            set({ userCity: 'your area' });
          }

          console.log('✅ Location request completed successfully');

        } catch (error: any) {
          console.error('❌ Error getting location:', error);
          
          let errorMessage = 'Failed to get location';
          
          if (error?.code === 1) {
            errorMessage = 'Location permission denied';
            console.log('🚫 User denied location permission');
          } else if (error?.code === 2) {
            errorMessage = 'Position unavailable';
            console.log('⚠️ Position unavailable');
          } else if (error?.code === 3) {
            errorMessage = 'Location request timed out';
            console.log('⏱️ Location request timed out');
          }
          
          set({
            error: errorMessage,
            hasLocationPermission: false,
            isLoading: false,
          });
          
          // Re-throw the error so calling code can handle it
          throw error;
        }
      },

      startLocationTracking: () => {
        if (!navigator.geolocation) {
          set({ 
            error: 'Geolocation is not supported by your browser',
            hasLocationPermission: false 
          });
          return;
        }

        // Stop existing tracking if any
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
        }

        watchId = navigator.geolocation.watchPosition(
          async (position) => {
            const coords: Coordinates = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };

            console.log('🔄 Location updated:', coords);
            set({
              currentLocation: coords,
              hasLocationPermission: true,
              error: null,
            });

            // Check if in Migori zone
            const inZone = isInMigoriZone(coords);
            set({ isInMigoriZone: inZone });
          },
          (error) => {
            set({
              error: error.message,
              hasLocationPermission: false,
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 30000, // Cache position for 30 seconds
          }
        );
      },

      stopLocationTracking: () => {
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        }
      },
    }),
    {
      name: 'location-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        hasSeenModal: state.hasSeenModal,
        hasLocationPermission: state.hasLocationPermission,
        // Don't persist currentLocation for privacy, but remember permission status
      }),
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Store rehydrated from localStorage:', state);
        // Check permission status after rehydration
        if (state) {
          state.checkPermissionStatus();
        }
      }
    }
  )
);
