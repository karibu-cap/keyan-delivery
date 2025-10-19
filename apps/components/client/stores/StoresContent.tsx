"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useT } from "@/hooks/use-inline-translation";
import { IMerchant } from "@/lib/actions/server/stores";
import { MerchantType } from "@prisma/client";
import { Store } from "lucide-react";
import { useMemo } from "react";
import { StoreCard } from "./StoreCard";

interface StoresContentProps {
  stores: IMerchant[];
  selectedMerchantType: string;
}

interface MerchantTypeFilter {
  id: string;
  name: string;
  count: number;
}

const ALL_FILTER_ID = "all";

export function StoresContent({ stores, selectedMerchantType }: StoresContentProps) {
  const t = useT();

  const { merchantTypeFilters, filteredStores } = useMemo(() => {
    // Compute counts
    let groceryCount = 0;
    let foodCount = 0;
    let pharmacyCount = 0;

    for (const store of stores) {
      const type =
        (store as IMerchant & { merchantType?: string }).merchantType ||
        MerchantType.GROCERY;

      if (type === MerchantType.GROCERY) groceryCount++;
      else if (type === MerchantType.FOOD) foodCount++;
      else if (type === MerchantType.PHARMACY) pharmacyCount++;
    }

    const filters: MerchantTypeFilter[] = [
      { id: ALL_FILTER_ID, name: t("All stores"), count: stores.length },
      { id: MerchantType.GROCERY, name: t("Grocery"), count: groceryCount },
      { id: MerchantType.FOOD, name: t("Food"), count: foodCount },
      { id: MerchantType.PHARMACY, name: t("Pharmacy"), count: pharmacyCount },
    ];

    const isAllSelected =
      selectedMerchantType === ALL_FILTER_ID ||
      selectedMerchantType === "" ||
      // backward-compat if previous code used a translated "all" as id
      selectedMerchantType === t("all");

    const filtered =
      isAllSelected
        ? stores
        : stores.filter(
            (store) =>
              (store as IMerchant & { merchantType?: string }).merchantType ===
              selectedMerchantType,
          );

    return { merchantTypeFilters: filters, filteredStores: filtered };
  }, [stores, selectedMerchantType, t]);

  const handleFilterChange = (filterId: string) => {
    const params = new URLSearchParams(window.location.search);
    if (filterId === ALL_FILTER_ID) {
      params.delete("merchantType");
    } else {
      params.set("merchantType", filterId);
    }
    window.location.search = params.toString();
  };

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
                  (selectedMerchantType || ALL_FILTER_ID) === filter.id
                    ? "secondary"
                    : "outline"
                }
                className={`rounded-full px-6 py-3 h-auto text-sm font-medium transition-all ${
                  (selectedMerchantType || ALL_FILTER_ID) === filter.id
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => handleFilterChange(filter.id)}
              >
                {filter.name}
                <Badge
                  variant="secondary"
                  className={`ml-2 ${
                    (selectedMerchantType || ALL_FILTER_ID) === filter.id
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
              value={selectedMerchantType || ALL_FILTER_ID}
              onValueChange={handleFilterChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("Select category")} />
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