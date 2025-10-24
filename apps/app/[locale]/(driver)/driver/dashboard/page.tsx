"use client";

import { DriverStatus } from "@prisma/client";
import { useAuthStore } from "@/hooks/use-auth-store";
import { DriverPendingStatus } from "@/components/driver/DriverPendingStatus";
import { DriverRejectedStatus } from "@/components/driver/DriverRejectedStatus";
import DriverDashboardClient from "@/components/driver/DriverDashboardClient";

export default function DriverDashboard() {
   const { user } = useAuthStore();
   // Display if status is PENDING
   if (user?.driverStatus === DriverStatus.PENDING) {
      return <DriverPendingStatus />;
   }

   // Display if status is REJECTED or BANNED
   if (user?.driverStatus === DriverStatus.REJECTED || user?.driverStatus === DriverStatus.BANNED) {
      return <DriverRejectedStatus />;
   }

   return <DriverDashboardClient />;
}
