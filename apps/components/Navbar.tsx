"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Menu, X, User, Store, Search, MapPin, Zap, ChevronDown, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ROUTES } from "@/lib/router";
import { useAuthStore } from "@/hooks/auth-store";
import { useCart } from "@/hooks/use-cart";
import { useDebounce } from "@/hooks/use-debounce";
import { AuthModal } from "@/components/auth/AuthModal";
import Image from "next/image";

interface SearchResult {
  id: string;
  title: string;
  type: 'product' | 'merchant' | 'category';
  image?: string;
  price?: number;
  category?: string;
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 300);

  const isActive = (path: string) => pathname === path;
  const { user, logout } = useAuthStore()
  const { cartItems, totalItems } = useCart()
  const quantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSignOut = async () => {
    try {
      await logout();
      setIsPopoverOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Search API call
  const searchItems = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedQuery) {
      searchItems(debouncedQuery);
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  }, [debouncedQuery]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setIsSearchOpen(false);
    setSearchQuery("");

    switch (result.type) {
      case 'product':
        router.push(`/product/${result.id}`);
        break;
      case 'merchant':
        router.push(`/stores/${result.id}`);
        break;
      case 'category':
        router.push(`/category/${result.id}`);
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isSearchOpen || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleResultClick(searchResults[selectedIndex]);
        } else {
          handleSearchSubmit(e);
        }
        break;
      case 'Escape':
        setIsSearchOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo and Store Selector */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-primary hidden sm:block">Keyan</span>
            </Link>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8" ref={searchRef}>
            <div className="relative w-full">
              <form onSubmit={handleSearchSubmit}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, stores, and recipes"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </form>

              {/* Search Results Dropdown */}
              {isSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((result, index) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleResultClick(result)}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 ${index === selectedIndex ? 'bg-gray-50' : ''
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
                              {result.category && <span>•</span>}
                              {result.category && <span>{result.category}</span>}
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
                      No results found for &ldquo;{searchQuery}&rdquo;
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Delivery/Pickup Toggle and Location */}
          <div className="flex items-center space-x-4">
            {/* Delivery/Pickup Toggle */}

            {/* Location Selector */}
            <Button variant="ghost" className="hidden md:flex items-center space-x-1 text-sm">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">New York, NY</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </Button>

            {/* Delivery Time Badge */}
            <div className="hidden lg:flex items-center space-x-1 bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
              <Zap className="w-3 h-3" />
              <span>By 10:30am</span>
            </div>

            {/* Cart Button */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                {quantity > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-xs text-white rounded-full">
                    {quantity}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User Menu */}
            {!user ? (
              <AuthModal>
                <Button variant="ghost" className="hidden sm:flex">
                  <User className="w-5 h-5 mr-2" />
                  Sign In
                </Button>
              </AuthModal>
            ) : (
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="hidden sm:flex">
                    <User className="w-5 h-5 mr-2" />
                    Profile
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
                      <Link href={ROUTES.profile} onClick={() => setIsPopoverOpen(false)}>
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href={ROUTES.orders}>
                        <Package className="w-4 h-4 mr-2" />
                        Orders
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <div className="relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, stores, and recipes"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </form>

            {/* Mobile Search Results Dropdown */}
            {isSearchOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((result, index) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 ${index === selectedIndex ? 'bg-gray-50' : ''
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
                            {result.category && <span>•</span>}
                            {result.category && <span>{result.category}</span>}
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
                    No results found for &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-gray-200 animate-slide-up">
            {/* Mobile Delivery/Pickup Toggle */}
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href={ROUTES.stores}>
                  <Store className="w-5 h-5 mr-3" />
                  Stores
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href={ROUTES.orders}>
                  <ShoppingCart className="w-5 h-5 mr-3" />
                  Orders
                </Link>
              </Button>
              {!user ? (
                <AuthModal>
                  <Button variant="outline" className="w-full">
                    <User className="w-5 h-5 mr-2" />
                    Sign In
                  </Button>
                </AuthModal>
              ) : (
                <Button variant="outline" className="w-full" asChild>
                  <Link href={ROUTES.profile}>
                    <User className="w-5 h-5 mr-2" />
                    Profile
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;