"use client";

import { AuthModal } from "@/components/auth/AuthModal";
import { SearchWithTypeahead } from "@/components/client/search/SearchWithTypeahead";
import { DriverBadge } from "@/components/driver/DriverBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ProductModal } from "@/components/ui/product-modal";
import { useAuthStore } from "@/hooks/auth-store";
import { useCart } from "@/hooks/use-cart";
import { useT } from "@/hooks/use-inline-translation";
import { IProduct } from "@/lib/actions/server/stores";
import { ROUTES } from "@/lib/router";
import {
  ChevronDown,
  LogOut,
  MapPin,
  Menu,
  Package,
  ShoppingCart,
  Store,
  User,
  X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface LocationState {
  address: string;
  loading: boolean;
  error: string | null;
}

const Navbar = () => {
  const t = useT();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [location, setLocation] = useState<LocationState>({
    address: t("Getting location..."),
    loading: true,
    error: null,
  });

  const router = useRouter();

  const { user, logout } = useAuthStore();
  const { cart } = useCart();

  // Geolocation: Get user's current location
  const getUserLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocation({
        address: t("Location unavailable"),
        loading: false,
        error: t("Geolocation not supported"),
      });
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            maximumAge: 300000,
            enableHighAccuracy: false,
          });
        }
      );

      const { latitude, longitude } = position.coords;
      await reverseGeocode(latitude, longitude);
    } catch (error) {
      console.error(t("Geolocation error:"), error);
      setLocation({
        address: t("Location unavailable"),
        loading: false,
        error: t("Unable to get location"),
      });
    }
  }, []);

  // Reverse geocoding to get address from coordinates
  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en-US,en;q=0.9",
          },
        }
      );

      if (!response.ok) throw new Error(t("Geocoding failed"));

      const data = await response.json();
      const address = data.address;

      // Format address: City, State/Region
      const city = address.city || address.town || address.village || address.county;
      const state = address.state || address.region;

      const formattedAddress = [city, state]
        .filter(Boolean)
        .join(", ") || t("Location found");

      setLocation({
        address: formattedAddress,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error(t("Reverse geocoding error:"), error);
      setLocation({
        address: t("Location unavailable"),
        loading: false,
        error: t("Unable to fetch address"),
      });
    }
  };

  // Initialize geolocation on mount
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
      setIsPopoverOpen(false);
      router.push("/");
    } catch (error) {
      console.error(t("Sign out error:"), error);
    }
  }, [logout, router, t]);

  // Handle search result selection from SearchWithTypeahead
  const handleSearchResultSelect = useCallback((result: any) => {
    // Map the result to product and open modal
    const productData: IProduct = {
      id: result.id,
      title: result.title,
      description: '',
      price: result.price,
      images: result.image ? [{ id: '', url: result.image, fileName: '', createdAt: new Date(), updatedAt: new Date(), blurDataUrl: null, creatorId: '', productId: null }] : [],
      categories: [],
      merchant: {
        id: '',
        businessName: result.merchant || '',
        slug: '',
        phone: '',
        logoUrl: null,
        bannerUrl: null,
        isVerified: false,
        merchantType: 'GROCERY' as const,
        address: { latitude: 0, longitude: 0 },
        createdAt: new Date(),
        updatedAt: new Date(),
        deliveryTime: null,
        rating: result.rating ?? null,
      },
      rating: result.rating ?? null,
      reviewCount: result.reviewCount ?? null,
      slug: '',
      status: 'VERIFIED' as const,
      visibility: true,
      merchantId: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      creatorId: '',
      compareAtPrice: null,
      inventory: null,
      unit: null,
      metadata: { seoTitle: '', seoDescription: '', keywords: [] },
      stock: null,
      badges: [],
      weight: null,
      weightUnit: null,
      savedListId: null,
      _count: { OrderItem: 0 , cartItems: 0},
    };
    
    setSelectedProduct(productData);
    setIsProductModalOpen(true);
  }, []);

  const handleProductModalClose = useCallback(() => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-primary hidden sm:block">
                Yetu
              </span>
            </Link>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <SearchWithTypeahead
              placeholder={t("Search products")}
              onResultSelect={handleSearchResultSelect}
              showFilters={false}
              className="w-full"
            />
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Location Selector */}
            <Button
              variant="ghost"
              className="hidden md:flex items-center space-x-1 text-sm"
              onClick={getUserLocation}
              disabled={location.loading}
              aria-label="Current location"
            >
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700 max-w-[150px] truncate">
                {location.address}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </Button>
            {/* the language switcher */}
            <LanguageSwitcher />

            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => router.push('/cart')}
              aria-label={`Shopping cart with ${cart.itemCount} items`}
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {cart.itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-xs text-white rounded-full">
                  {cart.itemCount}
                </Badge>
              )}
            </Button>

            {/* Driver Badge */}
            <DriverBadge />

            {/* User Menu */}
            {!user ? (
              <AuthModal>
                <Button variant="ghost" className="hidden sm:flex">
                  <User className="w-5 h-5 mr-2" />
                  {t("Sign In")}
                </Button>
              </AuthModal>
            ) : (
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="hidden sm:flex">
                    <User className="w-5 h-5 mr-2" />
                    {t("Profile")}
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="end">
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link
                        href={ROUTES.profile}
                        onClick={() => setIsPopoverOpen(false)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        {t("Profile")}
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link
                        href={ROUTES.orders}
                        onClick={() => setIsPopoverOpen(false)}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        {t("Orders")}
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t("Sign Out")}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <SearchWithTypeahead
            placeholder={t("Search products, stores, and recipes")}
            onResultSelect={handleSearchResultSelect}
            showFilters={false}
            className="w-full"
          />
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-gray-200 animate-slide-up">
            {/* Mobile Location */}
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={getUserLocation}
              disabled={location.loading}
            >
              <MapPin className="w-5 h-5 mr-3" />
              <span className="truncate">{location.address}</span>
            </Button>

            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href={ROUTES.stores}>
                <Store className="w-5 h-5 mr-3" />
                {t("Stores")}
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href={ROUTES.orders}>
                <ShoppingCart className="w-5 h-5 mr-3" />
                {t("Orders")}
              </Link>
            </Button>
            {!user ? (
              <AuthModal>
                <Button variant="outline" className="w-full">
                  <User className="w-5 h-5 mr-2" />
                  {t("Sign In")}
                </Button>
              </AuthModal>
            ) : (
              <Button variant="outline" className="w-full" asChild>
                <Link href={ROUTES.profile}>
                  <User className="w-5 h-5 mr-2" />
                  {t("Profile")}
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={handleProductModalClose}
      />
    </nav>
  );
};

export default Navbar;