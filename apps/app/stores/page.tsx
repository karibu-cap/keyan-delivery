"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Clock, Star, Truck, Store, Pill, UtensilsCrossed } from "lucide-react";
import { fetchMerchants, IMerchant } from "@/lib/actions/stores";
import { MerchantType } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const merchantTypeFilters = [
  { id: "all", name: "All stores", count: 0 },
  { id: "GROCERY", name: MerchantType.GROCERY, count: 0 },
  { id: "FOOD", name: MerchantType.FOOD, count: 0 },
  { id: "PHARMACY", name: MerchantType.PHARMACY, count: 0 },
];

const Stores = () => {
  const [selectedMerchantType, setSelectedMerchantType] = useState("all");
  const [stores, setStores] = useState<IMerchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStores = async () => {
      try {
        const response = await fetchMerchants();
        let filteredStores = response.merchants;

        if (selectedMerchantType !== 'all') {
          filteredStores = filteredStores.filter((store: IMerchant) =>
            (store as IMerchant & { merchantType: string }).merchantType === selectedMerchantType
          );
        }

        const groceryCount = response.merchants.filter((store: IMerchant) =>
          (store as IMerchant & { merchantType: string }).merchantType === MerchantType.GROCERY
        ).length;
        const foodCount = response.merchants.filter((store: IMerchant) =>
          (store as IMerchant & { merchantType: string }).merchantType === MerchantType.FOOD
        ).length;
        const pharmacyCount = response.merchants.filter((store: IMerchant) =>
          (store as IMerchant & { merchantType: string }).merchantType === MerchantType.PHARMACY
        ).length;

        merchantTypeFilters[1].count = groceryCount;
        merchantTypeFilters[2].count = foodCount;
        merchantTypeFilters[3].count = pharmacyCount;
        merchantTypeFilters[0].count = response.merchants.length;

        setStores(filteredStores);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stores');
        console.error('Error loading stores:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, [selectedMerchantType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading stores...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading stores</p>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header Section */}
      <section className="bg-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your stores</h1>
            <p className="text-gray-600">Shop from {stores.length} stores near you</p>
          </div>
          {/* Merchant Type Filters */}
          <div className="hidden md:flex flex-wrap gap-3">
            {merchantTypeFilters.map((filter) => (
              <Button
                key={filter.id}
                variant={selectedMerchantType === filter.id ? "secondary" : "outline"}
                className={`rounded-full px-6 py-3 h-auto text-sm font-medium transition-all ${selectedMerchantType === filter.id
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                onClick={() => setSelectedMerchantType(filter.id)}
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
          <div className="hidden max-md:block">
            <Select value={selectedMerchantType} onValueChange={setSelectedMerchantType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {merchantTypeFilters.map((filter) => (
                  <SelectItem key={filter.id} value={filter.id}>
                    {filter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {stores.length === 0 ? (
            <div className="text-center py-20">
              <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No stores found</p>
              <p className="text-gray-500">Try selecting a different store type</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store, index) => (
                <StoreCard key={store.id} store={store} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const StoreCard = ({ store, index }: { store: IMerchant; index: number }) => {
  const router = useRouter();
  const merchantType = (store as IMerchant & { merchantType: string }).merchantType || MerchantType.GROCERY;

  const getMerchantTypeIcon = (type: string) => {
    switch (type) {
      case MerchantType.FOOD:
        return <UtensilsCrossed className="w-5 h-5 text-orange-600" />;
      case MerchantType.PHARMACY:
        return <Pill className="w-5 h-5 text-blue-600" />;
      default:
        return <ShoppingBag className="w-5 h-5 text-green-600" />;
    }
  };

  const handleStoreClick = () => {
    router.push(`/stores/${store.id}`);
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={handleStoreClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            {getMerchantTypeIcon(merchantType)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{store.businessName}</h3>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Star className="w-4 h-4 fill-current text-yellow-400" />
              <span>{store.rating?.toFixed(1) || '4.5'}</span>
            </div>
          </div>
        </div>
        {merchantType === MerchantType.PHARMACY && (
          <Badge variant="outline" className="text-xs">
            In-store prices
          </Badge>
        )}
      </div>

      {/* Delivery Time */}
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="w-4 h-4 text-green-600" />
        <span className="text-sm text-gray-700">
          By {store.deliveryTime || '10:30am'}
        </span>
      </div>

      {/* Promotional Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {merchantType === MerchantType.GROCERY && (
          <>
            <Badge variant="promotional" className="text-xs">
              $5 off
            </Badge>
            <Badge variant="outline" className="text-xs">
              Free delivery
            </Badge>
          </>
        )}
        {merchantType === MerchantType.FOOD && (
          <Badge variant="promotional" className="text-xs">
            10% off orders $25+
          </Badge>
        )}
      </div>

      {/* Delivery Fee */}
      <div className="text-sm text-gray-600 mb-4">
        $0 standard delivery fee
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <Button className="flex-1 bg-primary hover:bg-primary-dark text-white">
          Shop now
        </Button>
        <Button variant="outline" className="px-4">
          <Truck className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Stores;