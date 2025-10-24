// /apps/hooks/useDriverTracking.ts
// Fichiers modifiés: useDriverTracking.ts

import { useState, useEffect, useCallback, useRef } from 'react';

export interface DriverLocation {
   latitude: number;
   longitude: number;
   timestamp: Date;
   accuracy?: number;
   heading?: number;
   speed?: number;
}

export interface TrackingData {
   driverLocation: DriverLocation | null;
   pickupLocation: { latitude: number; longitude: number; address: string };
   deliveryLocation: { latitude: number; longitude: number; address: string };
   orderStatus: string;
   estimatedArrival?: Date;
   distance?: number;
}

interface UseDriverTrackingOptions {
   orderId: string;
   updateInterval?: number; // en millisecondes
   enabled?: boolean;
}

export function useDriverTracking({
   orderId,
   updateInterval = 5000, // 5 secondes par défaut
   enabled = true,
}: UseDriverTrackingOptions) {
   const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<Error | null>(null);
   const intervalRef = useRef<NodeJS.Timeout | null>(null);
   const abortControllerRef = useRef<AbortController | null>(null);

   const fetchTrackingData = useCallback(async () => {
      if (!enabled || !orderId) return;

      try {
         // Annuler la requête précédente si elle existe
         if (abortControllerRef.current) {
            abortControllerRef.current.abort();
         }

         abortControllerRef.current = new AbortController();

         const response = await fetch(`/api/v1/orders/${orderId}/tracking`, {
            signal: abortControllerRef.current.signal,
            headers: {
               'Content-Type': 'application/json',
            },
         });

         if (!response.ok) {
            throw new Error(`Failed to fetch tracking data: ${response.status}`);
         }

         const data = await response.json();

         setTrackingData({
            ...data,
            driverLocation: data.driverLocation
               ? {
                  ...data.driverLocation,
                  timestamp: new Date(data.driverLocation.timestamp),
               }
               : null,
            estimatedArrival: data.estimatedArrival
               ? new Date(data.estimatedArrival)
               : undefined,
         });

         setError(null);
      } catch (err) {
         if (err instanceof Error && err.name === 'AbortError') {
            // Ignorer les erreurs d'annulation
            return;
         }
         console.error('Error fetching tracking data:', err);
         setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
         setIsLoading(false);
      }
   }, [orderId, enabled]);

   // Mise à jour manuelle de la position (pour les tests)
   const updateDriverLocation = useCallback((location: DriverLocation) => {
      setTrackingData((prev) => {
         if (!prev) return null;
         return {
            ...prev,
            driverLocation: location,
         };
      });
   }, []);

   // Initialisation et polling
   useEffect(() => {
      if (!enabled) {
         setIsLoading(false);
         return;
      }

      // Fetch initial
      fetchTrackingData();

      // Setup polling
      intervalRef.current = setInterval(fetchTrackingData, updateInterval);

      // Cleanup
      return () => {
         if (intervalRef.current) {
            clearInterval(intervalRef.current);
         }
         if (abortControllerRef.current) {
            abortControllerRef.current.abort();
         }
      };
   }, [fetchTrackingData, updateInterval, enabled]);

   return {
      trackingData,
      isLoading,
      error,
      refetch: fetchTrackingData,
      updateDriverLocation, // Pour simulation/test
   };
}