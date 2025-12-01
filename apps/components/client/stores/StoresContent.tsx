"use client";

import Lottie from "@/components/Lottie";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useT } from "@/hooks/use-inline-translation";
import { useLocationStore } from "@/hooks/use-location-store";
import { calculateTotalDistance } from "@/lib/utils/distance";
import food from "@/public/assets/food.json";
import town from "@/public/assets/town.json";
import mobileShopping from "@/public/assets/mobile_shopping.json";
import grocery from "@/public/assets/grocery.json";
import medications from "@/public/assets/medicaments.json";
import type { IMerchant } from "@/types/generic_types";
import { MerchantType } from "@prisma/client";
import { Store } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { StoreCard } from "./StoreCard";

interface StoresContentProps {
  stores: IMerchant[];
  selectedMerchantType: string;
}

interface StoreWithDistance extends IMerchant {
  distance?: number;
}

type SortOption = 'proximity' | 'rating' | 'name';

interface MerchantTypeFilter {
  id: string;
  name: string;
  count: number;
}

const ALL_FILTER_ID = "all";

export function StoresContent({ stores, selectedMerchantType }: StoresContentProps) {
  const t = useT();
  const { currentLocation, userCity } = useLocationStore();
  const [sortBy, setSortBy] = useState<SortOption | ''>('');
  const [storesWithDistance, setStoresWithDistance] = useState<StoreWithDistance[]>(stores);

  // Get dynamic text based on merchant type
  const getDynamicText = () => {
    const location = userCity || "your area";
    switch (selectedMerchantType) {
      case MerchantType.GROCERY:
        return t("Buy Groceries online from local stores in and around") + " " + location;
      case MerchantType.FOOD:
        return t("Order meals online from local restaurants in and around") + " " + location;
      case MerchantType.PHARMACY:
        return t("Buy medications online from local pharmacies in and around") + " " + location;
      default:
        return t("Shop online from local stores in and around") + " " + location;
    }
  };

  // Calculate distances for all stores
  useEffect(() => {
    if (!currentLocation) {
      setStoresWithDistance(stores);
      return;
    }

    const calculateDistances = async () => {
      const storesWithDist = await Promise.all(
        stores.map(async (store) => {
          if (!store.address.latitude || !store.address.longitude || !currentLocation) {
            return { ...store, distance: undefined };
          }

          try {
            const dist = await calculateTotalDistance({
              start: {
                lat: currentLocation.latitude,
                lng: currentLocation.longitude,
              },
              end: {
                lat: store.address.latitude,
                lng: store.address.longitude,
              },
            });
            return { ...store, distance: Math.round(dist * 10) / 10 };
          } catch (error) {
            console.error('Error calculating distance:', error);
            return { ...store, distance: undefined };
          }
        })
      );
      setStoresWithDistance(storesWithDist);
    };

    calculateDistances();
  }, [stores, currentLocation]);

  const { merchantTypeFilters, filteredStores } = useMemo(() => {
    // Compute counts
    let groceryCount = 0;
    let foodCount = 0;
    let pharmacyCount = 0;

    for (const store of storesWithDistance) {
      const type =
        (store as IMerchant & { merchantType?: string }).merchantType ||
        MerchantType.GROCERY;

      if (type === MerchantType.GROCERY) groceryCount++;
      else if (type === MerchantType.FOOD) foodCount++;
      else if (type === MerchantType.PHARMACY) pharmacyCount++;
    }

    const filters: MerchantTypeFilter[] = [
      { id: ALL_FILTER_ID, name: t("Select a category"), count: stores.length },
      { id: MerchantType.GROCERY, name: t("Grocery"), count: groceryCount },
      { id: MerchantType.FOOD, name: t("Food"), count: foodCount },
      { id: MerchantType.PHARMACY, name: t("Pharmacy"), count: pharmacyCount },
    ];

    const isAllSelected =
      selectedMerchantType === ALL_FILTER_ID ||
      selectedMerchantType === "" ||
      // backward-compat if previous code used a translated "all" as id
      selectedMerchantType === t("all");

    let filtered =
      isAllSelected
        ? storesWithDistance
        : storesWithDistance.filter(
          (store) =>
            (store as IMerchant & { merchantType?: string }).merchantType ===
            selectedMerchantType,
        );

    // Apply sorting (only if sortBy is selected)
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case 'proximity':
            if (!a.distance && !b.distance) return 0;
            if (!a.distance) return 1;
            if (!b.distance) return -1;
            return a.distance - b.distance;
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'name':
            return a.businessName.localeCompare(b.businessName);
          default:
            return 0;
        }
      });
    }

    return { merchantTypeFilters: filters, filteredStores: filtered };
  }, [storesWithDistance, selectedMerchantType, sortBy, t]);

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
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600 font-bold">
              {getDynamicText()}
            </p>
            {selectedMerchantType === MerchantType.FOOD && <Lottie src={food} autoplay={true} loop={true} className="w-24" />}
            {selectedMerchantType === MerchantType.PHARMACY && <Lottie src={medications} autoplay={true} loop={true} className="w-24" />}
            {selectedMerchantType === MerchantType.GROCERY && <Lottie src={grocery} autoplay={true} loop={true} className="w-24" />}
            {(!selectedMerchantType || selectedMerchantType === ALL_FILTER_ID) && <Lottie src={mobileShopping} autoplay={true} loop={true} className="w-24" />}
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Category Dropdown */}
            <Select
              value={selectedMerchantType || ALL_FILTER_ID}
              onValueChange={handleFilterChange}
            >
              <SelectTrigger className="w-[200px] bg-gray-900 text-white border-gray-900 hover:bg-gray-800">
                <SelectValue placeholder={t("Select category")} />
              </SelectTrigger>
              <SelectContent>
                {merchantTypeFilters.map((filter) => (
                  <SelectItem key={filter.id} value={filter.id}>
                    {filter.id === ALL_FILTER_ID ? filter.name : `${filter.name} (${filter.count})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort By Dropdown */}
            {currentLocation && (
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortOption)}
              >
                <SelectTrigger className="w-[200px] border-gray-300">
                  <SelectValue placeholder={t("Sort By")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proximity">{t("Closest distance")}</SelectItem>
                  <SelectItem value="rating">{t("Highest rating")}</SelectItem>
                  <SelectItem value="name">{t("A-Z (Store name)")}</SelectItem>
                </SelectContent>
              </Select>
            )}
            {!currentLocation && (
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortOption)}
              >
                <SelectTrigger className="w-[200px] border-gray-300">
                  <SelectValue placeholder={t("Sort By")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">{t("Highest rating")}</SelectItem>
                  <SelectItem value="name">{t("A-Z (Store name)")}</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Desktop Filters (Hidden - kept for backward compatibility) */}
          <div className="hidden flex-wrap gap-3">
            {merchantTypeFilters.map((filter) => (
              <Button
                key={filter.id}
                variant={
                  (selectedMerchantType || ALL_FILTER_ID) === filter.id
                    ? "secondary"
                    : "outline"
                }
                className={`rounded-full px-6 py-3 h-auto text-sm font-medium transition-all ${(selectedMerchantType || ALL_FILTER_ID) === filter.id
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                onClick={() => handleFilterChange(filter.id)}
              >
                {filter.name}
                <Badge
                  variant="secondary"
                  className={`ml-2 ${(selectedMerchantType || ALL_FILTER_ID) === filter.id
                    ? "bg-white text-gray-900"
                    : "bg-gray-100 text-gray-600"
                    }`}
                >
                  {filter.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Stores Grid */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Show Lottie town when "Select a category" is selected */}
          {(!selectedMerchantType || selectedMerchantType === ALL_FILTER_ID || selectedMerchantType === "") ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Lottie src={town} autoplay={true} loop={true} className="w-74 mb-6" />
              <p className="text-gray-600 text-xl font-semibold mb-2">
                {t("Select a category to view stores")}
              </p>
              <p className="text-gray-500">
                {t("Choose from Grocery, Food, or Pharmacy")}
              </p>
            </div>
          ) : filteredStores.length === 0 ? (
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