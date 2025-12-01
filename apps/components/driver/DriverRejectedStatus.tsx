"use client";

import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/hooks/use-auth-store";
import { DriverStatus } from "@prisma/client";
import { XCircle, AlertTriangle } from "lucide-react";

export function DriverRejectedStatus() {
    const { user } = useAuthStore();
    const isBanned = user?.driverStatus === DriverStatus.BANNED;

    return (
        <div className="min-h-screen">
            {/* Hero Section with Red Gradient */}
            <section className="gradient-hero py-8 sm:py-12 lg:py-16 px-4">
                <div className="container mx-auto max-w-2xl">
                    <div className="text-white text-center">
                        {/* Animated Icon */}
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4 animate-bounce">
                            {isBanned ? (
                                <AlertTriangle className="w-10 h-10 text-white" />
                            ) : (
                                <XCircle className="w-10 h-10 text-white" />
                            )}
                        </div>
                        {/* Header Title */}
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                            {isBanned ? "Account Banned" : "Application Rejected"}
                        </h1>
                        <p className="text-sm sm:text-base text-white/90">
                            {isBanned
                                ? "Your driver account has been banned"
                                : "Your driver application has been rejected"}
                        </p>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-18 max-w-2xl -mt-8">
                <Card className="p-8 rounded-2xl shadow-card border-2 border-red-200 dark:border-red-800">
                    <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-xl border border-red-200 dark:border-red-800">
                        <h2 className="font-semibold text-red-900 dark:text-red-100 mb-3">
                            What does this mean?
                        </h2>
                        <p className="text-sm text-red-800 dark:text-red-200 mb-4">
                            {isBanned
                                ? "Your account has been suspended and you can no longer access driver features. This decision was made by our administrators."
                                : "Unfortunately, your application to become a driver has not been approved at this time."}
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300">
                            {isBanned
                                ? "Please contact our support team for more information about this decision."
                                : "If you believe this is an error or would like more information, please contact our support team."}
                        </p>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <h3 className="font-semibold mb-2 text-sm">Need Help?</h3>
                        <p className="text-xs text-muted-foreground">
                            Contact our support team at <span className="font-mono text-primary">support@pataupesi.com</span> for assistance.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}