"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";
import { useT } from "@/hooks/use-inline-translation";
import { IMerchantDetail } from "@/lib/actions/server/stores";
import { ROUTES } from "@/lib/router";
import {
  ArrowLeft,
  Menu,
  Search,
  Shield,
  ShoppingCart,
  Star,
} from "lucide-react";
import { OptimizedImage } from "@/components/ClsOptimization";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { CategorySidebar } from "./CategorySidebar";
import { MobileCategoryDrawer } from "./MobileCategoryDrawer";
import { ProductGrid } from "./ProductGrid";

interface Aisle {
  id: string;
  name: string;
  count: number;
}

interface StoreDetailContentProps {
  initialStore: IMerchantDetail;
  initialAisles: Aisle[];
}

export function StoreDetailContent({
  initialStore,
  initialAisles,
}: StoreDetailContentProps) {
  const t = useT()

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart } = useCart();
  const router = useRouter();

  const filteredProducts = useMemo(() => {
    if (!initialStore.products) return [];

    return initialStore.products.filter((product) => {
      const matchesSearch = product.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        !selectedCategory ||
        product.categories?.some((cat) =>
          cat.category.name.toLowerCase().includes(selectedCategory.toLowerCase())
        );
      return matchesSearch && matchesCategory;
    });
  }, [initialStore.products, searchQuery, selectedCategory]);

  const onSaleProducts = useMemo(
    () => filteredProducts.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price).slice(0, 8),
    [filteredProducts]
  );

  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <>
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 lg:hidden sticky top-16 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Button variant="ghost" size="icon" aria-label="Back to stores" onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  router.push(ROUTES.stores);
                }
              }}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <OptimizedImage
                  src={initialStore.logoUrl || "/placeholder.svg"}
                  alt={initialStore.businessName}
                  width={32}
                  height={32}
                  className="rounded-lg flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h1 className="text-base font-semibold text-gray-900 truncate">
                    {initialStore.businessName}
                  </h1>
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{initialStore.rating?.toFixed(1) || "4.5"}</span>
                    </div>
                    <span>•</span>
                    <span className="truncate">
                      {initialStore.deliveryTime || "By 10:30am"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open categories"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <Link href="/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  aria-label={`Cart with ${cart.itemCount} items`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cart.itemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-primary text-white text-xs rounded-full">
                      {cart.itemCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="bg-white border-b border-gray-200 hidden lg:block sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" aria-label="Back to stores" onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  router.push(ROUTES.stores);
                }
              }}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <OptimizedImage
                  src={initialStore.logoUrl || "/placeholder.svg"}
                  alt={initialStore.businessName}
                  width={48}
                  height={48}
                  className="rounded-lg"
                />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {initialStore.businessName}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{initialStore.rating?.toFixed(1) || "4.5"}</span>
                    </div>
                    <span>•</span>
                    {initialStore.deliveryTime && (
                      <>
                        <span>{initialStore.deliveryTime}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{t("In-store prices")}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-sm text-gray-600">
                <Shield className="w-4 h-4 mr-2" />
                {t("100% satisfaction guarantee")}
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex space-x-8">
              <button className="py-4 border-b-2 border-gray-900 text-gray-900 font-medium">
                {t("Products")}
              </button>
              <button className="py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900">
                {t("About")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="lg:flex">
          {/* Desktop Sidebar */}
          {initialAisles && initialAisles.length > 1 && (
            <div className="hidden lg:block">
              <CategorySidebar
                aisles={initialAisles}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
              />
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 p-6">
            {/* On Sale Section */}
            {onSaleProducts.length > 0 && (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-4 py-2 rounded-lg mb-4 inline-flex items-center font-bold">
                  <span className="text-lg mr-2">🔥</span>
                  {t("On Sale")}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {t("Special Offers")}
                </h2>
                <ProductGrid products={onSaleProducts} />
              </div>
            )}

            {/* Search Bar */}
            <div className="relative max-w-md mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder={t("Search products...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full"
                aria-label="Search products"
              />
            </div>

            {/* All Products */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t("All Products")}
            </h2>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">{t("No products found")}</p>
              </div>
            ) : (
              <ProductGrid products={filteredProducts} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Category Drawer */}
      <MobileCategoryDrawer
        aisles={initialAisles}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        isOpen={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
      />
    </>
  );
}