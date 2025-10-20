"use client";

import Navbar from "@/components/Navbar";
import { DriverStatus } from "@prisma/client";
import { useAuthStore } from "@/hooks/auth-store";
import { DriverStatsCards } from "@/components/driver/DriverStatsCards";
import { DriverPendingStatus } from "@/components/driver/DriverPendingStatus";
import { DriverRejectedStatus } from "@/components/driver/DriverRejectedStatus";
import { DriverOrderTabs } from "@/components/driver/DriverOrderTabs";

export default function DriverDashboard() {
    const { user } = useAuthStore();

   // Display if statut is PENDING
   if (user?.driverStatus === DriverStatus.PENDING) {
      return <DriverPendingStatus />;
   }

   // Display if statut is REJECTED or BANNED
   if (user?.driverStatus === DriverStatus.REJECTED || user?.driverStatus === DriverStatus.BANNED) {
      return <DriverRejectedStatus />;
   }

   return (
      <div className="min-h-screen bg-background">
         <Navbar />

         <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
               <h1 className="text-4xl font-bold mb-2">Driver Dashboard</h1>
               <p className="text-muted-foreground">Manage your deliveries and earnings</p>
            </div>

            {/* Stats Cards - Updated by DriverOrderTabs */}
            <DriverStatsCards
            />

            {/* Orders Tabs - Now manages its own data */}
            <DriverOrderTabs
            />
         </div>
      </div>
   );
}
