// File: /app/[locale]/(driver)/driver/dashboard/page.tsx
// Driver dashboard with futuristic design and real-time data hydration

"use client";

import { DriverStatus } from "@prisma/client";
import { useAuthStore } from "@/hooks/auth-store";
import { DriverPendingStatus } from "@/components/driver/DriverPendingStatus";
import { DriverRejectedStatus } from "@/components/driver/DriverRejectedStatus";
import DriverDashboardClient from "@/components/driver/DriverDashboardClient";
import { useEffect } from "react";

export default function DriverDashboard() {
   const { user, reloadCurrentUser } = useAuthStore();
   
   useEffect(() => {
      reloadCurrentUser();
   }, [reloadCurrentUser]);

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
