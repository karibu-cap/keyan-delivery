"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store } from "lucide-react";
import { IMerchant } from "@/lib/actions/stores";
import { MerchantType } from "@prisma/client";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { StoreCard } from "./StoreCard";
import { useT } from "@/hooks/use-inline-translation";

interface StoresContentProps {
    initialStores: IMerchant[];
}

interface MerchantTypeFilter {
    id: string;
    name: string;
    count: number;
}

export function StoresContent({ initialStores }: StoresContentProps) {
    const t = useT()

    const [selectedMerchantType, setSelectedMerchantType] = useState(t("all"));

    // Calculate filter counts and filtered stores using useMemo
    const { merchantTypeFilters, filteredStores } = useMemo(() => {
        const groceryCount = initialStores.filter(
            (store) =>
                (store as IMerchant & { merchantType: string }).merchantType ===
                MerchantType.GROCERY
        ).length;

        const foodCount = initialStores.filter(
            (store) =>
                (store as IMerchant & { merchantType: string }).merchantType ===
                MerchantType.FOOD
        ).length;

        const pharmacyCount = initialStores.filter(
            (store) =>
                (store as IMerchant & { merchantType: string }).merchantType ===
                MerchantType.PHARMACY
        ).length;

        const filters: MerchantTypeFilter[] = [
            { id: t("all"), name: t("All stores"), count: initialStores.length },
            { id: MerchantType.GROCERY, name: t("Grocery"), count: groceryCount },
            { id: MerchantType.FOOD, name: t("Food"), count: foodCount },
            { id: MerchantType.PHARMACY, name: t("Pharmacy"), count: pharmacyCount },
        ];

        const filtered =
            selectedMerchantType === t("all")
                ? initialStores
                : initialStores.filter(
                    (store) =>
                        (store as IMerchant & { merchantType: string }).merchantType ===
                        selectedMerchantType
                );

        return { merchantTypeFilters: filters, filteredStores: filtered };
    }, [initialStores, selectedMerchantType]);

    const handleFilterChange = useCallback((filterId: string) => {
        setSelectedMerchantType(filterId);
    }, []);

    return (
        <>
            {/* Header Section */}
            <section className="bg-white py-8 px-4 border-b border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {t("Your stores")}
                        </h1>
                        <p className="text-gray-600">
                            {t("Shop from {count} stores", { count: filteredStores.length })}
                            {filteredStores.length !== 1 ? "s" : ""} {t("near you")}
                        </p>
                    </div>

                    {/* Desktop Filters */}
                    <div className="hidden md:flex flex-wrap gap-3">
                        {merchantTypeFilters.map((filter) => (
                            <Button
                                key={filter.id}
                                variant={
                                    selectedMerchantType === filter.id ? "secondary" : "outline"
                                }
                                className={`rounded-full px-6 py-3 h-auto text-sm font-medium transition-all ${selectedMerchantType === filter.id
                                    ? "bg-gray-900 text-white hover:bg-gray-800"
                                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                    }`}
                                onClick={() => handleFilterChange(filter.id)}
                            >
                                {filter.name}
                                <Badge
                                    variant="secondary"
                                    className={`ml-2 ${selectedMerchantType === filter.id
                                        ? "bg-white text-gray-900"
                                        : "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    {filter.count}
                                </Badge>
                            </Button>
                        ))}
                    </div>

                    {/* Mobile Filter Dropdown */}
                    <div className="md:hidden">
                        <Select
                            value={selectedMerchantType}
                            onValueChange={handleFilterChange}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {merchantTypeFilters.map((filter) => (
                                    <SelectItem key={filter.id} value={filter.id}>
                                        {filter.name} ({filter.count})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </section>

            {/* Stores Grid */}
            <section className="py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    {filteredStores.length === 0 ? (
                        <div className="text-center py-20">
                            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg mb-2">{t("No stores found")}</p>
                            <p className="text-gray-500">
                                {t("Try selecting a different store type")}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredStores.map((store, index) => (
                                <StoreCard key={store.id} store={store} index={index} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}