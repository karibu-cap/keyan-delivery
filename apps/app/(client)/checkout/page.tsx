"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  MapPin,
  Phone,
  CreditCard,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
import { ROUTES } from "@/lib/router";
import Image from "next/image";
import { createOrders } from "@/lib/actions/orders";
import { useToast } from "@/hooks/use-toast";

interface DeliveryInfo {
  address: string;
  latitude: number;
  longitude: number;
  contact: string;
  notes: string;
}

const EnhancedCheckout = () => {
  const router = useRouter();
  const { cartItems, total: cartTotal, clearCart } = useCart();
  const { toast } = useToast()
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    address: "",
    latitude: 0,
    longitude: 0,
    contact: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDeliveryInfo(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          toast({
            title: 'Location captured successfully',
            description: 'Please try again later',
            variant: 'default',
          })
        },
        (error) => {
          toast({
            title: 'Failed to get location',
            description: 'Please enter manually',
            variant: 'destructive',
          })
        }
      );
    } else {
      toast({
        title: 'Geolocation not supported',
        description: 'Please enter manually',
        variant: 'destructive',
      })
    }
  };

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
    // Validate delivery information
    if (!deliveryInfo.address || !deliveryInfo.contact) {
      toast({
        title: 'Please fill in all required delivery information',
        description: 'Please try again later',
        variant: 'destructive',
      })
      return;
    }

    if (!deliveryInfo.latitude || !deliveryInfo.longitude) {
      toast({
        title: 'Please capture your delivery location',
        description: 'Please try again later',
        variant: 'destructive',
      })
      return;
    }

    setIsSubmitting(true);

    const deliveryCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Prepare order data
    const orderData = {
      items: cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.price,
      })),
      deliveryInfo: {
        address: deliveryInfo.address,
        delivery_latitude: deliveryInfo.latitude,
        delivery_longitude: deliveryInfo.longitude,
        deliveryContact: deliveryInfo.contact,
        additionalNotes: deliveryInfo.notes || null,
      },
      orderPrices: {
        subtotal,
        shipping: deliveryFee,
        discount: 0,
        total,
        deliveryFee,
      },
      deliveryCode,
    };

    // Call API to create order
    const response = await createOrders(orderData);

    if (!response) {
      toast({
        title: 'Failed to place order',
        description: 'Please try again or contact support if the issue persists.',
        variant: 'destructive',
      })
      return;
    }

    toast({
      title: 'Order placed successfully!',
      description: `Your delivery code is: ${deliveryCode}`,
      variant: 'default',
    })

    // Clear cart and redirect
    clearCart();
    setIsSubmitting(false);
    router.push(`/orders`);

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
                    <h2 className="text-xl font-semibold">Delivery Location</h2>
                    <p className="text-sm text-muted-foreground">Where should we deliver?</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                >
                  Use Current Location
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your full delivery address"
                    value={deliveryInfo.address}
                    onChange={(e) => setDeliveryInfo(prev => ({ ...prev, address: e.target.value }))}
                    className="mt-2"
                    rows={3}
                  />
                </div>

                {deliveryInfo.latitude !== 0 && deliveryInfo.longitude !== 0 && (
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <p className="text-sm text-success-foreground">
                      ✓ Location captured: {deliveryInfo.latitude.toFixed(6)}, {deliveryInfo.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-6 rounded-2xl shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Contact Information</h2>
                  <p className="text-sm text-muted-foreground">For delivery updates</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="contact">Phone Number *</Label>
                  <Input
                    id="contact"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={deliveryInfo.contact}
                    onChange={(e) => setDeliveryInfo(prev => ({ ...prev, contact: e.target.value }))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions for delivery?"
                    value={deliveryInfo.notes}
                    onChange={(e) => setDeliveryInfo(prev => ({ ...prev, notes: e.target.value }))}
                    className="mt-2"
                    rows={2}
                  />
                </div>
              </div>
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
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-sm text-muted-foreground">Pay when you receive</div>
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

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <Card className="p-6 rounded-2xl shadow-card">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <Image
                        src={item.product.media?.url || "/placeholder.svg"}
                        alt={item.product.title}
                        className="w-16 h-16 rounded-2xl object-cover"
                        width={64}
                        height={64}
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
                    Secure delivery with confirmation code
                  </p>
                </div>

                {/* Place Order Button */}
                <Button
                  size="lg"
                  className="w-full rounded-2xl shadow-primary"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Placing Order..." : "Place Order"}
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

export default EnhancedCheckout;