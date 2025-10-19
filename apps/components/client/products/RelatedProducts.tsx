"use client";

import { MerchantProduct } from "@/components/client/stores/MerchantProduct";
import { useT } from "@/hooks/use-inline-translation";
import { motion } from "framer-motion";

interface RelatedProductsProps {
    products: any[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
    const t = useT();

    if (products.length === 0) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{t("Related Products")}</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {products.map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                        <MerchantProduct product={product} index={index} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
