"use client";

import { MerchantProduct } from "./MerchantProduct";
import { IProduct } from "@/lib/actions/stores";
import { motion, AnimatePresence } from "framer-motion";

interface ProductGridProps {
    products: IProduct[];
}

export function ProductGrid({ products }: ProductGridProps) {

    return (
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
    );
}