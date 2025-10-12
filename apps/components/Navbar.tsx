"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Menu,
  X,
  User,
  Store,
  Search,
  MapPin,
  ChevronDown,
  LogOut,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ROUTES } from "@/lib/router";
import { useAuthStore } from "@/hooks/auth-store";
import { useCart } from "@/hooks/use-cart";
import { useDebounce } from "@/hooks/use-debounce";
import { AuthModal } from "@/components/auth/AuthModal";
import { ProductModal } from "@/components/ui/product-modal";
import Image from "next/image";
import { search, SearchResult } from "@/lib/actions/client";
import { IProduct } from "@/lib/actions/stores";
import { DriverBadge } from "@/components/driver/DriverBadge";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useT } from "@/hooks/use-inline-translation";

interface LocationState {
  address: string;
  loading: boolean;
  error: string | null;
}

const Navbar = () => {
  const t = useT();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [location, setLocation] = useState<LocationState>({
    address: t("Getting location..."),
    loading: true,
    error: null,
  });

  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 300);

  const { user, logout } = useAuthStore();
  const { cartItems } = useCart();

  const quantity = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

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
  }, [logout, router]);

  // Search API call
  const searchItems = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await search(query);
      setSearchResults(response);
    } catch (error) {
      console.error(t("Search error:"), error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery) {
      searchItems(debouncedQuery);
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  }, [debouncedQuery, searchItems]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        const target = event.target as Element;
        if (!target.closest("[data-search-result]")) {
          setIsSearchOpen(false);
          setSelectedIndex(-1);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = useCallback(
    (result: SearchResult) => {
      setIsSearchOpen(false);
      setSearchQuery("");

      switch (result.type) {
        case "product":
          if (result.product) {
            setSelectedProduct(result.product);
            setIsProductModalOpen(true);
          }
          break;
        case "merchant":
          router.push(`/stores/${result.id}`);
          break;
      }
    },
    [router]
  );

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
                Keyan
              </span>
            </Link>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8" ref={searchRef}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t("Search products, stores, and recipes")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                aria-label="Search"
                aria-expanded={isSearchOpen}
                aria-controls="search-results"
              />

              {/* Search Results Dropdown */}
              {isSearchOpen && (
                <div
                  id="search-results"
                  role="listbox"
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
                >
                  {isLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                      {t("Searching...")}
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((result, index) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleResultClick(result)}
                          data-search-result
                          role="option"
                          aria-selected={index === selectedIndex}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors ${index === selectedIndex ? "bg-gray-50" : ""
                            }`}
                        >
                          {result.image && (
                            <Image
                              src={result.image}
                              alt={result.title}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {result.title}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center space-x-2">
                              <span className="capitalize">{result.type}</span>
                              {result.category && (
                                <>
                                  <span>•</span>
                                  <span>{result.category}</span>
                                </>
                              )}
                            </div>
                          </div>
                          {result.price && (
                            <div className="font-semibold text-primary">
                              ${result.price.toFixed(2)}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : searchQuery && !isLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      {t("No results found for")} &ldquo;{searchQuery}&rdquo;
                    </div>
                  ) : null}
                </div>
              )}
            </div>
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
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart" aria-label={`Shopping cart with ${quantity} items`}>
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                {quantity > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-xs text-white rounded-full">
                    {quantity}
                  </Badge>
                )}
              </Link>
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
          <div className="relative" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("Search products, stores, and recipes")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              aria-label="Search"
            />

            {/* Mobile Search Results Dropdown */}
            {isSearchOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                    {t("Searching...")}
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((result, index) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        type="button"
                        data-search-result
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors ${index === selectedIndex ? "bg-gray-50" : ""
                          }`}
                      >
                        {result.image && (
                          <Image
                            src={result.image}
                            alt={result.title}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {result.title}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                            <span className="capitalize">{result.type}</span>
                            {result.category && (
                              <>
                                <span>•</span>
                                <span>{result.category}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {result.price && (
                          <div className="font-semibold text-primary">
                            ${result.price.toFixed(2)}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : searchQuery && !isLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    {t("No results found for")} &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : null}
              </div>
            )}
          </div>
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