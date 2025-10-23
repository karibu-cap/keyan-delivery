// File: /app/[locale]/(driver)/driver/dashboard/page.tsx
// Driver dashboard with futuristic design and real-time data hydration
"use client"

import { DriverStatus } from "@prisma/client";
import { useAuthStore } from "@/hooks/auth-store";
import { DriverPendingStatus } from "@/components/driver/DriverPendingStatus";
import { DriverRejectedStatus } from "@/components/driver/DriverRejectedStatus";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function DriverDashboard() {
   const { user, reloadCurrentUser } = useAuthStore();
   const [isLoadingUser, setIsLoadingUser] = useState(true);
   
   useEffect(() => {
      const loadUser = async () => {
         setIsLoadingUser(true);
         await reloadCurrentUser();
         setIsLoadingUser(false);
      };
      loadUser();
   }, [reloadCurrentUser]);

   // Show skeleton while loading user data
   if (isLoadingUser) {
      return (
         <div className="min-h-screen">
            {/* Hero Skeleton */}
            <section className="gradient-hero py-8 sm:py-12 lg:py-16 px-4">
               <div className="container mx-auto max-w-7xl">
                  <Skeleton className="h-8 w-48 bg-white/20" />
                  <Skeleton className="h-4 w-64 mt-2 bg-white/20" />
               </div>
            </section>

            {/* Stats Cards Skeleton */}
            <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-6">
               <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                     <Card key={i} className="p-4 animate-pulse">
                        <Skeleton className="h-3 w-20 mb-2" />
                        <Skeleton className="h-6 w-12" />
                     </Card>
                  ))}
               </div>
            </div>

            {/* Content Skeleton */}
            <div className="container mx-auto max-w-7xl px-4 pb-12">
               <Skeleton className="h-12 w-full rounded-xl mb-6" />
               <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                     <Card key={i} className="p-4 animate-pulse">
                        <Skeleton className="h-32 w-full" />
                     </Card>
                  ))}
               </div>
            </div>
         </div>
      );
   }

   // Display if status is PENDING
   if (user?.driverStatus === DriverStatus.PENDING) {
      return <DriverPendingStatus />;
   }

   // Display if status is REJECTED or BANNED
   if (user?.driverStatus === DriverStatus.REJECTED || user?.driverStatus === DriverStatus.BANNED) {
      return <DriverRejectedStatus />;
   }

   return <DriverPendingStatus />;
}
