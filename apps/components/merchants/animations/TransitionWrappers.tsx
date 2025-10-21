"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Fade In Animation Wrapper
 */
export const FadeIn = ({
    children,
    delay = 0,
    duration = 0.3,
    className = ""
}: {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration, delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/**
 * Slide Up Animation Wrapper
 */
export const SlideUp = ({
    children,
    delay = 0,
    className = ""
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/**
 * Scale In Animation Wrapper
 */
export const ScaleIn = ({
    children,
    delay = 0,
    className = ""
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
                duration: 0.3,
                delay,
                type: "spring",
                stiffness: 300,
                damping: 20
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/**
 * Stagger Children Animation Wrapper
 */
export const StaggerChildren = ({
    children,
    staggerDelay = 0.1,
    className = ""
}: {
    children: React.ReactNode;
    staggerDelay?: number;
    className?: string;
}) => {
    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={{
                hidden: { opacity: 0 },
                show: {
                    opacity: 1,
                    transition: {
                        staggerChildren: staggerDelay,
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/**
 * Stagger Item (to be used inside StaggerChildren)
 */
export const StaggerItem = ({
    children,
    className = ""
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/**
 * Page Transition Wrapper
 */
export const PageTransition = ({
    children,
    className = ""
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className={className}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

/**
 * Hover Scale Wrapper
 */
export const HoverScale = ({
    children,
    scale = 1.05,
    className = ""
}: {
    children: React.ReactNode;
    scale?: number;
    className?: string;
}) => {
    return (
        <motion.div
            whileHover={{ scale }}
            whileTap={{ scale: scale - 0.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/**
 * Pulse Animation (for notifications/alerts)
 */
export const Pulse = ({
    children,
    className = ""
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <motion.div
            animate={{
                scale: [1, 1.05, 1],
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/**
 * Bounce Animation (for attention)
 */
export const Bounce = ({
    children,
    className = ""
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <motion.div
            animate={{
                y: [0, -10, 0],
            }}
            transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: "easeInOut",
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};