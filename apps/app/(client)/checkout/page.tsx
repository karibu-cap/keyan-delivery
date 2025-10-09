"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Clock,
  Shield,
  Plus,
  Minus,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
import { CartItem } from "@/hooks/use-cart";
import { ROUTES } from "@/lib/router";

const Checkout = () => {
  const [allowSubstitutions, setAllowSubstitutions] = useState(true);
  const { cartItems, total: cartTotal, totalItems, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-md text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                <svg className="h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="mb-2 text-2xl font-bold">Your cart is empty</h1>
            <p className="mb-6 text-muted-foreground">Add items to your cart to proceed with checkout</p>
            <Link href="/stores">
              <Button className="bg-[#0aad0a] hover:bg-[#089808]">Start Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cartTotal;
  const deliveryFee = 2.99;
  const serviceFee = 1.99;
  const total = subtotal + deliveryFee + serviceFee;

  const handlePlaceOrder = async () => {
    try {
      // Here you would typically make an API call to place the order
      // For now, we'll just simulate success

      toast.success("Order placed successfully!", {
        description: "Your delivery code will be shared shortly.",
      });

      // Clear the cart after successful order
      clearCart();
    } catch (error) {
      toast.error("Failed to place order", {
        description: "Please try again or contact support if the issue persists.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <Navbar />

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Link
          href={ROUTES.stores}
          className="inline-flex items-center text-foreground mb-6 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Continue shopping
        </Link>

        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card className="p-6 rounded-2xl shadow-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Delivery Address</h2>
                    <p className="text-sm text-muted-foreground">Where should we deliver?</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>

              <div className="bg-accent p-4 rounded-2xl">
                <p className="font-medium">Home</p>
                <p className="text-sm text-muted-foreground">123 Main Street, Apt 4B</p>
                <p className="text-sm text-muted-foreground">Kigali, Rwanda</p>
              </div>
            </Card>

            {/* Delivery Time */}
            <Card className="p-6 rounded-2xl shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Delivery Time</h2>
                  <p className="text-sm text-muted-foreground">Estimated: 25-35 minutes</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="default" className="rounded-2xl flex-1">
                  ASAP
                </Button>
                <Button variant="outline" className="rounded-2xl flex-1">
                  Schedule
                </Button>
              </div>
            </Card>

            {/* Substitution Preferences - Real-time toggle */}
            <Card className="p-6 rounded-2xl shadow-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Allow Substitutions</h3>
                    <p className="text-sm text-muted-foreground">
                      Let us replace out-of-stock items with similar alternatives
                    </p>
                  </div>
                </div>
                <Switch
                  checked={allowSubstitutions}
                  onCheckedChange={setAllowSubstitutions}
                />
              </div>

              {allowSubstitutions && (
                <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-2xl animate-slide-up">
                  <p className="text-sm text-success-foreground">
                    ✓ Merchant will be notified of your substitution preferences
                  </p>
                </div>
              )}
            </Card>

            {/* Payment Method */}
            <Card className="p-6 rounded-2xl shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Payment Method</h2>
                  <p className="text-sm text-muted-foreground">Select payment option</p>
                </div>
              </div>

              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start rounded-2xl h-auto p-4">
                  <CreditCard className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Credit Card</div>
                    <div className="text-sm text-muted-foreground">•••• 4242</div>
                  </div>
                </Button>

                <Button variant="outline" className="w-full justify-start rounded-2xl h-auto p-4">
                  <div className="w-5 h-5 mr-3 font-bold text-primary">M</div>
                  <div className="text-left">
                    <div className="font-medium">MTN Mobile Money</div>
                    <div className="text-sm text-muted-foreground">Pay with MTN Momo</div>
                  </div>
                </Button>
              </div>
            </Card>
          </div>

          {/* Order Summary Sidebar - Sticky */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <Card className="p-6 rounded-2xl shadow-card">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {cartItems.map((item: CartItem) => (
                    <div key={item.product.id} className="flex gap-3">
                      <img
                        src={item.product.media?.url || "/placeholder.svg"}
                        alt={item.product.title}
                        className="w-16 h-16 rounded-2xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">{item.product.title}</h4>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span className="font-medium">${serviceFee.toFixed(2)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="flex items-center gap-2 p-3 bg-accent rounded-2xl mb-6">
                  <Shield className="w-5 h-5 text-success" />
                  <p className="text-sm text-muted-foreground">
                    Secure payment with pickup & delivery codes
                  </p>
                </div>

                {/* Place Order Button */}
                <Button
                  size="lg"
                  className="w-full rounded-2xl shadow-primary"
                  onClick={handlePlaceOrder}
                >
                  Place Order
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  By placing an order, you agree to our Terms of Service
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;