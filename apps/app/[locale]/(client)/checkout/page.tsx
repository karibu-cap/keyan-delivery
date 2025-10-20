"use client";

import { OptimizedImage } from "@/components/ClsOptimization";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/use-cart";
import { useT } from "@/hooks/use-inline-translation";
import { useToast } from "@/hooks/use-toast";
import { getDeliveryZones, type DeliveryZone } from "@/lib/actions/client/zone";
import { createOrders } from "@/lib/actions/orders";
import { ROUTES } from "@/lib/router";
import {
  ArrowLeft,
  Check,
  Clock,
  CreditCard,
  MapPin,
  Package,
  Phone,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


interface DeliveryInfo {
  address: string;
  contact: string;
  notes: string;
}

const EnhancedCheckout = () => {
  const t = useT();
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { toast } = useToast();

  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    address: "",
    contact: "",
    notes: "",
  });
  const [isLoadingZones, setIsLoadingZones] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch delivery zones on mount
  useEffect(() => {
    const fetchDeliveryZones = async () => {
      try {
        setIsLoadingZones(true);
        const response = await getDeliveryZones();

        if (response) {
          setDeliveryZones(response);
        }
      } catch (error) {
        console.error('Error fetching delivery zones:', error);
        toast({
          title: t("Failed to load delivery zones"),
          description: t("Please refresh the page"),
          variant: 'destructive',
        });
      } finally {
        setIsLoadingZones(false);
      }
    };

    fetchDeliveryZones();
  }, []);

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-md text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <h1 className="mb-2 text-2xl font-bold">{t("Your cart is empty")}</h1>
            <p className="mb-6 text-muted-foreground">{t("Add items to your cart to proceed with checkout")}</p>
            <Link href="/stores">
              <Button className="bg-primary hover:bg-[#089808]">{t("Start Shopping")}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cart.total;
  const deliveryFee = selectedZone?.deliveryFee || 0;
  const serviceFee = 1.99;
  const total = subtotal + deliveryFee + serviceFee;

  const canPlaceOrder = () => {
    if (!selectedZone || !deliveryInfo.address.trim() || !deliveryInfo.contact.trim()) {
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!canPlaceOrder()) {
      toast({
        title: t("Please complete all required fields"),
        description: t("Make sure you've selected a zone and filled in delivery details"),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const deliveryCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Prepare order data
    const orderData = {
      items: cart.items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.price,
        merchantId: item.product.merchant.id,
      })),
      deliveryInfo: {
        address: deliveryInfo.address,
        deliveryContact: deliveryInfo.contact,
        additionalNotes: deliveryInfo.notes || null,
      },
      orderPrices: {
        subtotal,
        shipping: serviceFee,
        discount: 0,
        total,
        deliveryFee,
      },
      deliveryZoneId: selectedZone!.id,
      deliveryCode,
    };

    try {
      const response = await createOrders(orderData);

      if (!response) {
        toast({
          title: t("Failed to place order"),
          description: t("Please try again or contact support if the issue persists."),
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: t("Order placed successfully!"),
        description: t("Your delivery code is: {deliveryCode}", { deliveryCode }),
        variant: 'default',
      });

      router.push(`/orders`);
      clearCart();

    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: t("Failed to place order"),
        description: t("Please try again"),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Link
          href={ROUTES.stores}
          className="inline-flex items-center text-foreground mb-6 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("Continue shopping")}
        </Link>

        <h1 className="text-4xl font-bold mb-2">{t("Checkout")}</h1>
        <p className="text-muted-foreground mb-8">{t("Select your delivery zone")}</p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Zone Selection */}
            <Card className="p-6 rounded-2xl shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{t("Delivery Zone")}</h2>
                  <p className="text-sm text-muted-foreground">{t("Choose where you want delivery")}</p>
                </div>
              </div>

              {isLoadingZones ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-muted rounded-xl"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4">
                  {deliveryZones.map((zone) => {
                    const isSelected = selectedZone?.id === zone.id;

                    return (
                      <button
                        key={zone.id}
                        onClick={() => setSelectedZone(zone)}
                        className={`relative p-5 border-2 rounded-xl text-left transition-all ${isSelected
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border hover:border-primary/50 hover:shadow-sm'
                          }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Zone Badge */}
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
                            style={{ backgroundColor: zone.color }}
                          >
                            {zone.code === 'HUB_A' ? 'H' : zone.code[0]}
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Zone Header */}
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-bold">{zone.name}</h3>
                                <span
                                  className="inline-block mt-1 px-3 py-1 rounded-full text-white text-xs font-semibold"
                                  style={{ backgroundColor: zone.color }}
                                >
                                  {zone.code}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold">${zone.deliveryFee.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">{t("delivery")}</p>
                              </div>
                            </div>

                            {/* Zone Details */}
                            <div className="flex flex-wrap gap-4 mb-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock size={16} />
                                <strong>{zone.estimatedDeliveryMinutes} min</strong>
                              </span>
                            </div>

                            {/* Neighborhoods */}
                            <div className="mb-2">
                              <p className="text-xs font-semibold text-muted-foreground mb-2">{t("Areas included")}:</p>
                              <div className="flex flex-wrap gap-1">
                                {zone.neighborhoods.slice(0, 6).map((neighborhood, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-muted text-foreground rounded text-xs"
                                  >
                                    {neighborhood}
                                  </span>
                                ))}
                                {zone.neighborhoods.length > 6 && (
                                  <span className="px-2 py-1 text-muted-foreground text-xs">
                                    +{zone.neighborhoods.length - 6} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Selection Checkmark */}
                          {isSelected && (
                            <div className="absolute top-4 right-4">
                              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <Check className="text-primary-foreground" size={20} />
                              </div>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Delivery Address - Shows after zone selection */}
            {selectedZone && (
              <Card className="p-6 rounded-2xl shadow-card animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{t("Complete Address")}</h2>
                    <p className="text-sm text-muted-foreground">{t("Street / Details")}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">{t("Full Address")} *</Label>
                    <Textarea
                      id="address"
                      placeholder={t("Ex: Carrefour Mendong, near the pharmacy\nBlue house with white gate")}
                      value={deliveryInfo.address}
                      onChange={(e) => setDeliveryInfo(prev => ({ ...prev, address: e.target.value }))}
                      className="mt-2"
                      rows={4}
                    />
                  </div>

                  {/* Selected Zone Summary */}
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{t("Selected zone")}:</p>
                        <p className="font-semibold">{selectedZone.name}</p>
                      </div>
                      <span
                        className="px-3 py-1 rounded-full text-white text-sm font-semibold"
                        style={{ backgroundColor: selectedZone.color }}
                      >
                        {selectedZone.code}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Contact Information */}
            {selectedZone && (
              <Card className="p-6 rounded-2xl shadow-card animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{t("Contact Information")}</h2>
                    <p className="text-sm text-muted-foreground">{t("For delivery updates")}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contact">{t("Phone Number")} *</Label>
                    <Input
                      id="contact"
                      type="tel"
                      placeholder="+237 XXX XXX XXX"
                      value={deliveryInfo.contact}
                      onChange={(e) => setDeliveryInfo(prev => ({ ...prev, contact: e.target.value }))}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">{t("Additional Notes (Optional)")}</Label>
                    <Textarea
                      id="notes"
                      placeholder={t("Any special instructions for delivery?")}
                      value={deliveryInfo.notes}
                      onChange={(e) => setDeliveryInfo(prev => ({ ...prev, notes: e.target.value }))}
                      className="mt-2"
                      rows={2}
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Payment Method */}
            {selectedZone && (
              <Card className="p-6 rounded-2xl shadow-card animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{t("Payment Method")}</h2>
                    <p className="text-sm text-muted-foreground">{t("Select payment option")}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start rounded-2xl h-auto p-4 border-primary">
                    <CreditCard className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">{t("Cash on Delivery")}</div>
                      <div className="text-sm text-muted-foreground">{t("Pay when you receive")}</div>
                    </div>
                  </Button>

                  <Button variant="outline" className="w-full justify-start rounded-2xl h-auto p-4" disabled>
                    <div className="w-5 h-5 mr-3 font-bold text-primary">M</div>
                    <div className="text-left">
                      <div className="font-medium">{t("MTN Mobile Money")}</div>
                      <div className="text-sm text-muted-foreground">{t("Coming soon")}</div>
                    </div>
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <Card className="p-6 rounded-2xl shadow-card">
                <h2 className="text-2xl font-bold mb-6">{t("Order Summary")}</h2>

                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {cart.items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <OptimizedImage
                        src={item.product.images[0].url || "/icons/ios/542.png"}
                        alt={item.product.title}
                        className="w-16 h-16 rounded-2xl object-cover"
                        width={64}
                        blurDataURL={item.product.images[0]?.blurDataUrl || undefined}
                        height={64}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">{item.product.title}</h4>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("Subtotal")}</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("Delivery Fee")}
                      {selectedZone && (
                        <span className="text-xs ml-1">({selectedZone.code})</span>
                      )}
                    </span>
                    <span className="font-medium">
                      {selectedZone ? `$${deliveryFee.toFixed(2)}` : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("Service Fee")}</span>
                    <span className="font-medium">${serviceFee.toFixed(2)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>{t("Total")}</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Delivery Estimate */}
                {selectedZone && (
                  <div className="mb-6 p-3 bg-primary/10 border border-primary/20 rounded-2xl">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      {t("Estimated delivery")}: <strong>{selectedZone.estimatedDeliveryMinutes} {t("minutes")}</strong>
                    </p>
                  </div>
                )}

                {/* Security Badge */}
                <div className="flex items-center gap-2 p-3 bg-accent rounded-2xl mb-6">
                  <Shield className="w-5 h-5 text-success" />
                  <p className="text-sm text-muted-foreground">
                    {t("Secure delivery with confirmation code")}
                  </p>
                </div>

                {/* Place Order Button */}
                <Button
                  size="lg"
                  className="w-full rounded-2xl shadow-primary"
                  onClick={handlePlaceOrder}
                  disabled={!canPlaceOrder() || isSubmitting}
                >
                  {isSubmitting
                    ? t("Placing Order...")
                    : !selectedZone
                      ? t("Select Delivery Zone")
                      : !deliveryInfo.address.trim()
                        ? t("Enter Address")
                        : !deliveryInfo.contact.trim()
                          ? t("Enter Phone Number")
                          : t("Place Order")
                  }
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  {t("By placing an order, you agree to our Terms of Service")}
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