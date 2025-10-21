"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

/**
 * Animated Loading Spinner
 */
export const LoadingSpinner = ({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) => {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
            className={className}
        >
            <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        </motion.div>
    );
};

/**
 * Loading Dots Animation
 */
export const LoadingDots = () => {
    return (
        <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="w-3 h-3 bg-primary rounded-full"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                    }}
                />
            ))}
        </div>
    );
};

/**
 * Dashboard Stats Cards Skeleton
 */
export const StatsCardSkeleton = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <Card className="rounded-2xl">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-3">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-8 w-32" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <Skeleton className="w-12 h-12 rounded-lg" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
};

/**
 * Order Card Skeleton
 */
export const OrderCardSkeleton = ({ count = 3 }: { count?: number }) => {
    return (
        <div className="space-y-4">
            {[...Array(count)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <Card className="rounded-2xl">
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-6 w-32" />
                                        <Skeleton className="h-4 w-48" />
                                        <Skeleton className="h-4 w-40" />
                                    </div>
                                    <Skeleton className="h-8 w-24 rounded-full" />
                                </div>

                                {/* Items */}
                                <div className="grid grid-cols-2 gap-3">
                                    {[...Array(2)].map((_, j) => (
                                        <div key={j} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                            <Skeleton className="w-14 h-14 rounded-lg" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-3 w-16" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Skeleton className="h-10 flex-1" />
                                    <Skeleton className="h-10 flex-1" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
};

/**
 * Product Card Skeleton
 */
export const ProductCardSkeleton = ({ count = 6 }: { count?: number }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(count)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-border"
                >
                    <Skeleton className="w-16 h-16 rounded-2xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

/**
 * Page Loading Overlay
 */
export const PageLoadingOverlay = ({ message }: { message?: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center space-y-4"
            >
                <LoadingSpinner size="lg" />
                {message && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm text-muted-foreground"
                    >
                        {message}
                    </motion.p>
                )}
            </motion.div>
        </motion.div>
    );
};

/**
 * Shimmer Effect for Content Loading
 */
export const ShimmerCard = () => {
    return (
        <div className="relative overflow-hidden bg-muted rounded-lg h-32">
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                    x: ["-100%", "100%"],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
        </div>
    );
};

/**
 * Success Animation
 */
export const SuccessAnimation = ({ message }: { message?: string }) => {
    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
            }}
            className="flex flex-col items-center justify-center p-8"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{
                    type: "spring",
                    stiffness: 200,
                    delay: 0.2,
                }}
                className="w-20 h-20 rounded-full bg-primary/10 dark:bg-primary flex items-center justify-center mb-4"
            >
                <motion.svg
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="w-10 h-10 text-primary/60 dark:text-primary/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <motion.path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                    />
                </motion.svg>
            </motion.div>
            {message && (
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm font-medium"
                >
                    {message}
                </motion.p>
            )}
        </motion.div>
    );
};