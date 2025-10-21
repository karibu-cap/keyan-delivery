"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/use-inline-translation";
import { IMerchant } from "@/lib/actions/server/stores";
import { MerchantType } from "@prisma/client";
import {
    Clock,
    Pill,
    ShoppingBag,
    Star,
    Truck,
    UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface StoreCardProps {
    store: IMerchant;
    index: number;
}

export function StoreCard({ store, index }: StoreCardProps) {
    const t = useT()

    const router = useRouter();
    const merchantType =
        (store as IMerchant & { merchantType: string }).merchantType ||
        MerchantType.GROCERY;

    const getMerchantTypeIcon = useCallback((type: string) => {
        switch (type) {
            case MerchantType.FOOD:
                return <UtensilsCrossed className="w-5 h-5 text-orange-600" />;
            case MerchantType.PHARMACY:
                return <Pill className="w-5 h-5 text-blue-600" />;
            default:
                return <ShoppingBag className="w-5 h-5 text-primary/60" />;
        }
    }, []);


    const handleShopNowClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            router.push(`/stores/${store.id}`);
        },
        [router, store.id]
    );

    const handleDeliveryClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        // Handle delivery options
    }, []);

    return (
        <Link href={'/stores/' + store.slug}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer animate-slide-up group"
            tabIndex={0}
            aria-label={`View ${store.businessName} store`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border border-gray-200 group-hover:border-primary/30 transition-colors">
                        {getMerchantTypeIcon(merchantType)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary transition-colors">
                            {store.businessName}
                        </h3>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">
                                {store.rating?.toFixed(1) || "4.5"}
                            </span>
                            <span className="text-gray-400">• 500+ ratings</span>
                        </div>
                    </div>
                </div>
                {merchantType === MerchantType.PHARMACY && (
                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                        {t("In-store prices")}
                    </Badge>
                )}
            </div>

            {/* Delivery Time */}
            <div className="flex items-center space-x-2 mb-4 bg-primary/5 rounded-lg px-3 py-2">
                <Clock className="w-4 h-4 text-primary/60" />
                <span className="text-sm font-medium text-primary/70">
                    {t("Delivery by")} {store.deliveryTime || "10:30am"}
                </span>
            </div>

            {/* Promotional Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
                {merchantType === MerchantType.GROCERY && (
                    <>
                        <Badge variant="promotional" className="text-xs">
                            {t("$5 off first order")}
                        </Badge>
                        <Badge
                            variant="outline"
                            className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                        >
                            🚚 {t("Free delivery")}
                        </Badge>
                    </>
                )}
                {merchantType === MerchantType.FOOD && (
                    <Badge variant="promotional" className="text-xs">
                        🔥 {t("10% off orders $25+")}
                    </Badge>
                )}
                {merchantType === MerchantType.PHARMACY && (
                    <Badge
                        variant="outline"
                        className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                    >
                        ⚡ {t("Same-day delivery")}
                    </Badge>
                )}
            </div>

            {/* Delivery Fee */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <span className="text-sm text-gray-600">{t("Delivery fee")}</span>
                <span className="text-sm font-semibold text-primary/60">
                    {t("FREE ($0.00)")}
                </span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
                <Button
                    className="flex-1 bg-primary hover:bg-primary text-white shadow-sm hover:shadow-md transition-all"
                    onClick={handleShopNowClick}
                >
                    {t("Shop now")}
                </Button>
                <Button
                    variant="outline"
                    className="px-4 hover:bg-gray-50 hover:border-primary/30 transition-all"
                    onClick={handleDeliveryClick}
                    aria-label="Delivery options"
                >
                    <Truck className="w-4 h-4" />
                </Button>
            </div>
        </Link>
    );
}
