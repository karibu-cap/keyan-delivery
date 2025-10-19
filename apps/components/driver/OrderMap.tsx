"use client";

import { useEffect, useState } from "react";
import { X, Navigation, MapPin, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OrderMapProps {
   order: {
      id: string;
      deliveryInfo: {
         address: string;
         delivery_latitude: number;
         delivery_longitude: number;
         deliveryContact: string | null;
      };
      merchant: {
         businessName: string;
         address: {
            latitude: number;
            longitude: number;
         };
      };
      orderPrices: {
         total: number;
         deliveryFee: number;
      };
   };
   onClose: () => void;
}

export default function OrderMap({ order, onClose }: OrderMapProps) {
   const [currentLocation, setCurrentLocation] = useState<{
      latitude: number;
      longitude: number;
   } | null>(null);

   useEffect(() => {
      // Get current location
      if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(
            (position) => {
               setCurrentLocation({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
               });
            },
            (error) => {
               console.error({ message: "Error getting location:", error });
            }
         );
      }
   }, []);

   const openInGoogleMaps = () => {
      const destination = `${order.deliveryInfo.delivery_latitude},${order.deliveryInfo.delivery_longitude}`;
      const origin = currentLocation
         ? `${currentLocation.latitude},${currentLocation.longitude}`
         : "";

      // Open Google Maps with directions
      const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
      window.open(url, "_blank");
   };

   const calculateDistance = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
   ): string => {
      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
         Math.cos((lat1 * Math.PI) / 180) *
         Math.cos((lat2 * Math.PI) / 180) *
         Math.sin(dLon / 2) *
         Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return distance.toFixed(2);
   };

   const merchantDistance = currentLocation
      ? calculateDistance(
         currentLocation.latitude,
         currentLocation.longitude,
         order.merchant.address.latitude,
         order.merchant.address.longitude
      )
      : "N/A";

   const deliveryDistance = currentLocation
      ? calculateDistance(
         currentLocation.latitude,
         currentLocation.longitude,
         order.deliveryInfo.delivery_latitude,
         order.deliveryInfo.delivery_longitude
      )
      : "N/A";

   return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
         <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between z-10">
               <div>
                  <h2 className="text-2xl font-bold">Delivery Navigation</h2>
                  <p className="text-sm text-muted-foreground">
                     Order #{order.id.slice(-6)}
                  </p>
               </div>
               <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-2xl"
               >
                  <X className="w-5 h-5" />
               </Button>
            </div>

            <div className="p-6 space-y-6">
               {/* Map Placeholder */}
               <div className="relative w-full h-96 bg-accent rounded-2xl overflow-hidden">
                  {/* In production, integrate Google Maps or Mapbox here */}
                  <iframe
                     width="100%"
                     height="100%"
                     style={{ border: 0 }}
                     loading="lazy"
                     allowFullScreen
                     src={`https://www.google.com/maps/embed/v1/directions?key=YOUR_API_KEY&origin=${order.merchant.address.latitude},${order.merchant.address.longitude}&destination=${order.deliveryInfo.delivery_latitude},${order.deliveryInfo.delivery_longitude}&mode=driving`}
                  ></iframe>

                  {/* Fallback UI */}
                  <div className="absolute inset-0 flex items-center justify-center bg-accent">
                     <div className="text-center">
                        <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">
                           Map integration requires Google Maps API key
                        </p>
                        <Button onClick={openInGoogleMaps} className="rounded-2xl">
                           <Navigation className="w-4 h-4 mr-2" />
                           Open in Google Maps
                        </Button>
                     </div>
                  </div>
               </div>

               {/* Location Cards */}
               <div className="grid md:grid-cols-2 gap-4">
                  {/* Pickup Location */}
                  <Card className="p-4 rounded-2xl border-2 border-primary/20">
                     <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                           <Store className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">Pickup Location</h3>
                              <Badge variant="outline" className="text-xs">
                                 {merchantDistance} km
                              </Badge>
                           </div>
                           <p className="text-sm font-medium mb-1">
                              {order.merchant.businessName}
                           </p>
                           <p className="text-sm text-muted-foreground">
                              Lat: {order.merchant.address.latitude.toFixed(6)}
                              <br />
                              Lng: {order.merchant.address.longitude.toFixed(6)}
                           </p>
                        </div>
                     </div>
                  </Card>

                  {/* Delivery Location */}
                  <Card className="p-4 rounded-2xl border-2 border-success/20">
                     <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-success/10 flex items-center justify-center flex-shrink-0">
                           <MapPin className="w-5 h-5 text-success" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">Delivery Location</h3>
                              <Badge variant="outline" className="text-xs">
                                 {deliveryDistance} km
                              </Badge>
                           </div>
                           <p className="text-sm mb-1">{order.deliveryInfo.address}</p>
                           <p className="text-sm text-muted-foreground">
                              Contact: {order.deliveryInfo.deliveryContact}
                           </p>
                        </div>
                     </div>
                  </Card>
               </div>

               {/* Order Summary */}
               <Card className="p-4 rounded-2xl bg-accent/50">
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-sm text-muted-foreground mb-1">Order Total</p>
                        <p className="text-2xl font-bold">${order.orderPrices.total.toFixed(2)}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Your Earning</p>
                        <p className="text-2xl font-bold text-success">
                           ${order.orderPrices.deliveryFee.toFixed(2)}
                        </p>
                     </div>
                  </div>
               </Card>

               {/* Navigation Button */}
               <Button
                  onClick={openInGoogleMaps}
                  className="w-full h-12 text-lg rounded-2xl"
               >
                  <Navigation className="w-5 h-5 mr-2" />
                  Start Navigation in Google Maps
               </Button>

               {/* Current Location Info */}
               {currentLocation && (
                  <div className="text-center text-sm text-muted-foreground">
                     Your location: {currentLocation.latitude.toFixed(6)},{" "}
                     {currentLocation.longitude.toFixed(6)}
                  </div>
               )}
            </div>
         </Card>
      </div>
   );
}