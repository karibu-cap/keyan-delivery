"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useDriverOrders } from "@/hooks/use-driver-orders-query";
import { ROUTES } from "@/lib/router";
import { DriverStatus, UserRole } from "@prisma/client";
import { AlertCircle, CheckCircle, Truck, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DriverBadgeProps {
   onClick?: () => void;
}

export function DriverBadge({ onClick }: DriverBadgeProps) {
   const router = useRouter();
   const { user, refreshSession } = useAuthStore();
   const { availableOrders } = useDriverOrders();

   const [config, setConfig] = useState(() => ({
      icon: Truck,
      color: "bg-gray-400 hover:bg-gray-500",
      text: "Driver",
      showCount: false,
   }));

   const [StatusIcon, setStatusIcon] = useState(() => Truck);

   const handleClick = (status: DriverStatus) => {
      if (onClick) return onClick();

      switch (status) {
         case DriverStatus.APPROVED:
            router.push(ROUTES.driverDashboard);
            break;
         case DriverStatus.PENDING:
         case DriverStatus.REJECTED:
         case DriverStatus.BANNED:
            router.push(ROUTES.driverReview);
            break;
         default:
            break;
      }
   };

   const getStatusConfig = () => {
      switch (user?.driverStatus) {
         case DriverStatus.APPROVED:
            return {
               icon: CheckCircle,
               color: "bg-primary hover:bg-primary/90",
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
               color: "bg-red-500 hover:bg-primary",
               text: "Rejected",
               showCount: false,
            };
         case DriverStatus.BANNED:
            return {
               icon: XCircle,
               color: "bg-primary hover:bg-red-700",
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
      refreshSession();
   }, [refreshSession])

   useEffect(() => {
      const statusConfig = getStatusConfig();
      setConfig(statusConfig);
      setStatusIcon(statusConfig.icon);
   }, [user?.driverStatus]);


   if (!user?.roles?.includes(UserRole.driver)) return null;

   return (
      <Button
         onClick={() =>
            handleClick(user?.driverStatus || DriverStatus.BANNED)
         }
         variant="ghost"
         className="relative flex items-center gap-2 h-auto px-3 py-2"
      >
         <div className={`p-1.5 rounded-lg ${config.color} transition-colors`}>
            <StatusIcon className="w-4 h-4 text-white" />
         </div>

         <div className="flex flex-col items-start">
            <span className="text-xs font-medium">Driver dashboard</span>
            <span className="text-xs text-muted-foreground">{config.text}</span>
         </div>

         {config.showCount && availableOrders.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs rounded-full">
               {availableOrders.length > 9 ? "9+" : availableOrders.length}
            </Badge>
         )}
      </Button>
   );
}
