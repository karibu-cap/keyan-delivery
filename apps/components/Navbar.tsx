"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X, User, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/router";
import { useAuthStore } from "@/hooks/auth-store";
import { useCart } from "@/hooks/use-cart";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: ROUTES.stores, label: "Stores" },
    { href: ROUTES.orders, label: "Orders" },
  ];

  const isActive = (path: string) => pathname === path;
  const { user } = useAuthStore()
  const { cartItems, totalItems } = useCart()
  const quantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);


  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-2xl gradient-hero flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-primary">Keyan</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${isActive(link.href) ? "text-primary" : "text-muted-foreground"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <ShoppingCart className="w-5 h-5" />
                {quantity > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-xs">
                    {quantity}
                  </Badge>
                )}
              </Link>
            </Button>

            {!user && <Button asChild variant="ghost">
              <Link href={ROUTES.signIn}>
                <User className="w-5 h-5 mr-2" />
                Sign In
              </Link>
            </Button>}

            {user && <Button asChild variant="ghost">
              <Link href={ROUTES.profile}>
                <User className="w-5 h-5 mr-2" />
                Profile
              </Link>
            </Button>}

          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 animate-slide-up">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block py-2 text-sm font-medium transition-colors hover:text-primary ${isActive(link.href) ? "text-primary" : "text-muted-foreground"
                  }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                  <User className="w-5 h-5 mr-2" />
                  Sign In
                </Link>
              </Button>
              <Button asChild className="w-full rounded-2xl">
                <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                  Admin Portal
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;