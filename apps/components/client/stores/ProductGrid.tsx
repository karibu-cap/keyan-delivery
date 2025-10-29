"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AnimatePresence, motion } from "framer-motion";
import { MerchantProduct } from "./MerchantProduct";
import type { IProduct } from "@/types/generic_types";

interface ProductGridProps {
    products: IProduct[];
}

export function ProductGrid({ products }: ProductGridProps) {

    return (
        <ErrorBoundary>
            <motion.div
                layout
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
                <AnimatePresence mode="popLayout">
                    {products.map((product, index) => (
                        <MerchantProduct key={product.id} product={product} index={index} />
                    ))}
                </AnimatePresence>
            </motion.div>
        </ErrorBoundary>
    );
}