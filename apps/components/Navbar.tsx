// Updated Navbar component with requested header adjustments.
// NOTE: Search bar moved, text updated, margins adjusted, font-size reduced, button length aligned.

"use client";

import { AuthModal, useAuthModal } from "@/components/auth/AuthModal";
import { SearchWithTypeahead } from "@/components/client/search/SearchWithTypeahead";
import { DriverBadge } from "@/components/driver/DriverBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ProductModal } from "@/components/ui/product-modal";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useCart } from "@/hooks/use-cart";
import { useT } from "@/hooks/use-inline-translation";
import { ROUTES } from "@/lib/router";
import {
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  Store,
  User,
  X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import type { IProduct } from "@/types/generic_types";

const Navbar = () => {
  const t = useT();
  const { openModal } = useAuthModal();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);

  const router = useRouter();

  const { logout, authUser, isAuthenticated } = useAuthStore();

  const { cart } = useCart();

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
      setIsPopoverOpen(false);
      router.push("/");
    } catch (error) {
      console.error(t("Sign out error:"), error);
    }
  }, [logout, router, t]);

  const handleSearchResultSelect = useCallback((result: any) => {
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
        merchantType: 'GROCERY',
        address: { latitude: 0, longitude: 0 },
        createdAt: new Date(),
        updatedAt: new Date(),
        deliveryTime: null,
        rating: result.rating ?? null,
      },
      rating: result.rating ?? null,
      reviewCount: result.reviewCount ?? null,
      slug: '',
      status: 'VERIFIED',
      visibility: true,
      merchantId: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      creatorId: '',
      compareAtPrice: null,
      inventory: null,
      unit: null,
      metadata: { seoTitle: '', seoDescription: '', keywords: [] },
      badges: [],
      weight: null,
      weightUnit: null,
      savedListId: null,
      _count: { OrderItem: 0, cartItems: 0 },
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
        <div className="flex items-center justify-between h-16 gap-2">

          {/* A2 BUTTON LENGTH SAME AS A3 (SIGN IN BUTTON OR AVATAR) */}
          <Link href="/" className="flex items-center space-x-2 group ml-[2px]">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src="/logo/logo.png"
                alt="Pataupesi Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <span className="text-xl font-bold text-primary hidden sm:block">
              Pataupesi
            </span>
          </Link>

          {/* B1 Search bar moved to the center & text updated */}
          <div className="flex flex-1 max-w-md mx-4">
            <SearchWithTypeahead
              placeholder={t("Search for Products or Stores")}
              onResultSelect={handleSearchResultSelect}
              showFilters={false}
              className="w-full text-sm"
            />
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-3 mr-[2px]"> 

            <LanguageSwitcher />

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => router.push('/cart')}
            >
              <ShoppingCart className="w-5 h-5 text-gray-700 scale-x-[-1]" />
              {cart.itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-xs text-white rounded-full">
                  {cart.itemCount}
                </Badge>
              )}
            </Button>

            <DriverBadge />

            {!isAuthenticated() ? (
              <Button variant="ghost" className="hidden sm:flex w-24 justify-center">
                <User className="w-5 h-5 mr-2" />
                {t("Sign In")}
              </Button>
            ) : (
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <div className="cursor-pointer w-8 h-8" onClick={() => setIsPopoverOpen(true)}>
                    <Avatar className="cursor-pointer w-8 h-8">
                      <AvatarImage src={authUser?.image ?? ''} alt="user" />
                      <AvatarFallback>{authUser?.name?.split(' ').map((name: string) => name.charAt(0).toUpperCase()).join('')}</AvatarFallback>
                    </Avatar>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="end">
                  <div className="space-y-1">
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href={ROUTES.profile}><User className="w-4 h-4 mr-2" />{t("Profile")}</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href={ROUTES.orders}><Package className="w-4 h-4 mr-2" />{t("Orders")}</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-primary hover:bg-red-50" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />{t("Sign Out")}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
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

