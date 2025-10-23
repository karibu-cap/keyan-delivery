"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { DriverStatus, UserRole } from "@prisma/client";
import { useAuthStore } from "@/hooks/auth-store";
import { fetchDriverAvailableOrders } from "@/lib/actions/client/driver";
import { ROUTES } from "@/lib/router";
import { useDriverOrders } from "@/hooks/use-driver-orders";

interface DriverBadgeProps {
   onClick?: () => void;
}

export function DriverBadge({ onClick }: DriverBadgeProps) {
   const router = useRouter();
   const { user } = useAuthStore();
   const { availableOrders } = useDriverOrders();

   if (!user?.roles?.includes(UserRole.driver)) {
      return null;
   }

   const handleClick = (status: DriverStatus) => {
      if (onClick) {
         onClick();
      } else {
         if (status === DriverStatus.APPROVED) {
            router.push(ROUTES.driverDashboard);
         }
         if (status === DriverStatus.PENDING || status === DriverStatus.REJECTED || status === DriverStatus.BANNED) {
            router.push(ROUTES.driverPending);
         }
      }
   };

   const getStatusConfig = () => {
      switch (user.driverStatus) {
         case DriverStatus.APPROVED:
            return {
               icon: CheckCircle,
               color: "bg-primary hover:bg-primary",
               text: "Active Driver",
               showCount: true,
            };
         case DriverStatus.PENDING:
            return {
               icon: AlertCircle,
               color: "bg-gray-400 hover:bg-gray-500",
               text: "Pending",
               showCount: false,
            };
         case DriverStatus.REJECTED:
            return {
               icon: XCircle,
               color: "bg-red-500 hover:bg-red-600",
               text: "Rejected",
               showCount: false,
            };
         case DriverStatus.BANNED:
            return {
               icon: XCircle,
               color: "bg-red-600 hover:bg-red-700",
               text: "Banned",
               showCount: false,
            };
         default:
            return {
               icon: Truck,
               color: "bg-gray-400 hover:bg-gray-500",
               text: "Driver",
               showCount: false,
            };
      }
   };

   useEffect(() => {
      const load = async () => {
         await fetchDriverAvailableOrders();
      };
      load();
   }, [fetchDriverAvailableOrders])

   const config = getStatusConfig();
   const StatusIcon = config.icon;

   return (
      <Button
         onClick={() => handleClick(user.driverStatus || DriverStatus.BANNED)}
         variant="ghost"
         className="relative flex items-center gap-2 h-auto px-3 py-2"
      >
         <div className={`p-1.5 rounded-lg ${config.color} transition-colors`}>
            <StatusIcon className="w-4 h-4 text-white" />
         </div>

         <div className="flex flex-col items-start">
            <span className="text-xs font-medium">Driver dashboard</span>
            <span className="text-xs text-muted-foreground">{config.text}</span>
            {/* {config.showCount && !loading && (
               <span className="text-xs text-muted-foreground">
                  {pendingOrdersCount} {pendingOrdersCount === 1 ? "order" : "orders"}
               </span>
            )} */}
         </div>

         {config.showCount && availableOrders.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs rounded-full">
               {availableOrders.length > 9 ? "9+" : availableOrders.length}
            </Badge>
         )}
      </Button>
   );
}