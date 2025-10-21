"use client";

import { motion, type Variants } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Package,
    ShoppingBag,
    Search,
    Plus,
    TrendingUp,
    Clock
} from "lucide-react";
import { useT } from "@/hooks/use-inline-translation";
import Link from "next/link";

interface EmptyStateProps {
    type: "orders" | "products" | "search" | "history" | "transactions";
    title?: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

const iconAnimation: Variants = {
    initial: { scale: 0, rotate: -180 },
    animate: {
        scale: 1,
        rotate: 0,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20,
        }
    },
};

const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
        duration: 2,
        repeat: Infinity,
    },
};

export default function EmptyState({
    type,
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
}: EmptyStateProps) {
    const t = useT();

    const configs = {
        orders: {
            icon: ShoppingBag,
            defaultTitle: t("No active orders"),
            defaultDescription: t("New orders will appear here"),
            iconColor: "text-orange-500",
            bgColor: "bg-orange-50 dark:bg-orange-950/20",
        },
        products: {
            icon: Package,
            defaultTitle: t("No products found"),
            defaultDescription: t("Start by adding your first product"),
            iconColor: "text-blue-500",
            bgColor: "bg-blue-50 dark:bg-blue-950/20",
            actionLabel: t("Add Product"),
        },
        search: {
            icon: Search,
            defaultTitle: t("No results found"),
            defaultDescription: t("Try adjusting your filters"),
            iconColor: "text-purple-500",
            bgColor: "bg-purple-50 dark:bg-purple-950/20",
        },
        history: {
            icon: Clock,
            defaultTitle: t("No order history"),
            defaultDescription: t("Completed and cancelled orders will appear here"),
            iconColor: "text-gray-500",
            bgColor: "bg-gray-50 dark:bg-gray-950/20",
        },
        transactions: {
            icon: TrendingUp,
            defaultTitle: t("No transactions found"),
            defaultDescription: t("Transactions will appear here once you start receiving payments"),
            iconColor: "text-primary/50",
            bgColor: "bg-primary/5 dark:bg-green-950/20",
        },
    };

    const config: any = configs[type];
    const Icon = config.icon;

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="w-full"
        >
            <Card className="p-8 sm:p-12 rounded-2xl shadow-card">
                <div className="text-center max-w-md mx-auto">
                    {/* Animated Icon */}
                    <motion.div
                        variants={iconAnimation}
                        initial="initial"
                        animate="animate"
                        className="inline-block mb-6"
                    >
                        <motion.div
                            animate={floatingAnimation}
                            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full ${config.bgColor} flex items-center justify-center mx-auto`}
                        >
                            <Icon className={`w-10 h-10 sm:w-12 sm:h-12 ${config.iconColor}`} />
                        </motion.div>
                    </motion.div>

                    {/* Text Content */}
                    <motion.div variants={item} className="space-y-2 mb-6">
                        <h3 className="text-lg sm:text-xl font-semibold">
                            {title || config.defaultTitle}
                        </h3>
                        <p className="text-sm sm:text-base text-muted-foreground">
                            {description || config.defaultDescription}
                        </p>
                    </motion.div>

                    {/* Action Button */}
                    {(actionLabel || config.actionLabel) && (
                        <motion.div variants={item}>
                            {actionHref ? (
                                <Link href={actionHref}>
                                    <Button className="w-full sm:w-auto">
                                        <Plus className="w-4 h-4 mr-2" />
                                        {actionLabel || config.actionLabel}
                                    </Button>
                                </Link>
                            ) : onAction ? (
                                <Button onClick={onAction} className="w-full sm:w-auto">
                                    <Plus className="w-4 h-4 mr-2" />
                                    {actionLabel || config.actionLabel}
                                </Button>
                            ) : null}
                        </motion.div>
                    )}

                    {/* Decorative Elements */}
                    <div className="mt-8 flex justify-center gap-2">
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    delay: 0.5 + i * 0.1,
                                    type: "spring",
                                    stiffness: 200,
                                }}
                                className="w-2 h-2 rounded-full bg-muted-foreground/20"
                            />
                        ))}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}