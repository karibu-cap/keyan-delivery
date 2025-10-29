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
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { LongLat } from "@prisma/client";

// Dynamic import for MapPicker (client-side only)
const MapPicker = dynamic(() => import("@/components/client/map/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-muted animate-pulse rounded-xl flex items-center justify-center">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  )
});

interface DeliveryInfo {
  additionalNotes: string;
  deliveryContact: string;
  landmarkName?: string;
  manualCoordinates?: LongLat;
}

const EnhancedCheckout = () => {
  const t = useT();
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { toast } = useToast();

  // State management
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [selectedLandmark, setSelectedLandmark] = useState<string | null>(null);
  const [manualCoordinates, setManualCoordinates] = useState<LongLat | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    additionalNotes: "",
    deliveryContact: "",
    landmarkName: "",
    manualCoordinates: undefined,
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

  // Reset landmark and delivery info when zone changes
  useEffect(() => {
    setSelectedLandmark(null);
    setManualCoordinates(null);
    setShowMapPicker(false);
    setDeliveryInfo({
      additionalNotes: "",
      deliveryContact: "",
      landmarkName: "",
      manualCoordinates: undefined,
    });
  }, [selectedZone]);

  // Empty cart check
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
            <p className="mb-6 text-muted-foreground">
              {t("Add items to your cart to proceed with checkout")}
            </p>
            <Link href="/stores">
              <Button className="bg-primary hover:bg-[#089808]">
                {t("Start Shopping")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals
  const subtotal = cart.total;
  const deliveryFee = selectedZone?.deliveryFee || 0;
  const total = subtotal + deliveryFee;

  // Validation
  const canPlaceOrder = () => {
    if (!selectedZone) return false;
    if (selectedLandmark === null) return false;

    // If map option selected, require coordinates
    if (selectedLandmark === 'map' && !manualCoordinates) return false;

    if (!deliveryInfo.additionalNotes.trim()) return false;
    if (!deliveryInfo.deliveryContact.trim() || deliveryInfo.deliveryContact.length < 9) return false;
    return true;
  };

  // Handle zone selection
  const handleZoneSelect = (zone: DeliveryZone) => {
    setSelectedZone(zone);
  };

  // Handle landmark selection
  const handleLandmarkSelect = (landmarkName: string | 'none' | 'map') => {
    setSelectedLandmark(landmarkName);

    if (landmarkName === 'none') {
      setDeliveryInfo(prev => ({ ...prev, landmarkName: undefined }));
      setShowMapPicker(false);
      setManualCoordinates(null);
    } else if (landmarkName === 'map') {
      setDeliveryInfo(prev => ({ ...prev, landmarkName: undefined }));
      setShowMapPicker(true);
    } else {
      setDeliveryInfo(prev => ({ ...prev, landmarkName }));
      setShowMapPicker(false);
      setManualCoordinates(null);
    }
  };

  // Place order
  const handlePlaceOrder = async () => {
    if (!canPlaceOrder()) {
      toast({
        title: t("Please complete all required fields"),
        description: t("Make sure you've filled in all delivery details"),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    // Prepare order data
    const orderData = {
      items: cart.items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.price,
        merchantId: item.product.merchant?.id,
      })),
      deliveryInfo: {
        additionalNotes: deliveryInfo.additionalNotes,
        deliveryContact: deliveryInfo.deliveryContact,
        landmarkName: deliveryInfo.landmarkName,
        manualCoordinates: manualCoordinates,
      },
      orderPrices: {
        subtotal,
        shipping: 0,
        discount: 0,
        total,
        deliveryFee,
      },
      deliveryZoneId: selectedZone!.id,
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
        description: t("Wait a few second, you will be redirected to order page."),
        variant: 'default',
      });

      router.replace(`/orders`);
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

  // Get coordinate source display info
  const getCoordinateSourceInfo = () => {
    // CASE 1: MANUAL - User dropped pin on map
    if (selectedLandmark === 'map' && manualCoordinates) {
      return {
        icon: "🎯",
        text: t("Precise location from map pin"),
        color: "text-green-600",
        confidence: t("High accuracy - GPS coordinates")
      };
    }

    // CASE 2: LANDMARK - User selected a landmark
    if (deliveryInfo.landmarkName && selectedLandmark !== 'none' && selectedLandmark !== 'map') {
      return {
        icon: "🎯",
        text: t("Precise location from landmark"),
        color: "text-green-600",
        confidence: t("High accuracy")
      };
    }

    return {
      icon: "📍",
      text: t("Approximate zone location"),
      color: "text-orange-600",
      confidence: t("Driver will call for directions")
    };
  };

  const coordinateInfo = getCoordinateSourceInfo();

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
        <p className="text-muted-foreground mb-8">
          {t("Complete your order in a few simple steps")}
        </p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* STEP 1: Delivery Zone Selection */}
            <Card className="p-6 rounded-2xl shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {t("Step 1: Delivery Zone")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t("Choose your delivery area")}
                  </p>
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
                        onClick={() => handleZoneSelect(zone)}
                        className={`relative p-5 border-2 rounded-xl text-left transition-all ${isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                          }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span
                                className="px-3 py-1 rounded-full text-white text-sm font-semibold"
                                style={{ backgroundColor: zone.color }}
                              >
                                {zone.code}
                              </span>
                              <h3 className="font-semibold text-lg">{zone.name}</h3>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                <CreditCard className="w-4 h-4" />
                                {t.formatAmount(zone.deliveryFee)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {zone.estimatedDeliveryMinutes} min
                              </span>
                            </div>

                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                {t("Covers")}:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {zone.landmarks.map(e => e.name).slice(0, 6).map((neighborhood, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-muted text-foreground rounded text-xs"
                                  >
                                    {neighborhood}
                                  </span>
                                ))}
                                {zone.landmarks.map(e => e.name).length > 6 && (
                                  <span className="px-2 py-1 text-muted-foreground text-xs">
                                    +{zone.landmarks.map(e => e.name).length - 6} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

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

            {/* STEP 2: Landmark Selection */}
            {selectedZone && (selectedZone.landmarks && selectedZone.landmarks.length > 0 ? (
              <Card className="p-6 rounded-2xl shadow-card animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {t("Step 2: Choose Location Method")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t("How would you like to specify your location?")}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-semibold"> {t("Our delivery zones")}</p>
                <div className="space-y-3 max-h-[300px] overflow-y-scroll bg-accent border-2 rounded-xl p-4">
                  {/* Sort: Popular landmarks first */}
                  {selectedZone.landmarks
                    .sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0))
                    .map((landmark) => (
                      <button
                        key={landmark.name}
                        onClick={() => handleLandmarkSelect(landmark.name)}
                        className={`w-full p-4 bg-white border-2 rounded-xl text-left transition-all hover:border-primary ${selectedLandmark === landmark.name
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
                              {landmark.category === 'supermarket' && '🏪'}
                              {landmark.category === 'station' && '⛽'}
                              {landmark.category === 'market' && '🏛️'}
                              {landmark.category === 'airport' && '✈️'}
                              {landmark.category === 'neighborhood' && '🏘️'}
                              {!landmark.category && '📍'}
                            </div>
                            <div>
                              <p className="font-medium">{landmark.name}</p>
                              {landmark.isPopular && (
                                <span className="text-xs text-primary flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-current" />
                                  {t("Popular choice")}
                                </span>
                              )}
                            </div>
                          </div>
                          {selectedLandmark === landmark.name && (
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <Check className="text-white" size={16} />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                </div>
                <p className="text-lg font-semibold">{t("Other option")}</p>

                {/* OPTION: Drop pin on map */}
                <button
                  onClick={() => handleLandmarkSelect('map')}
                  className={`w-full p-4 border-2 rounded-xl text-left transition-all hover:border-primary ${selectedLandmark === 'map'
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
                        🗺️
                      </div>
                      <div>
                        <p className="font-medium">{t("Drop pin on map")}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("Select your exact location")}
                        </p>
                      </div>
                    </div>
                    {selectedLandmark === 'map' && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="text-white" size={16} />
                      </div>
                    )}
                  </div>
                </button>
              </Card>
            ) : (
              // For zones without landmarks, auto-select "describe location"
              <div className="hidden">
                <div>
                  <p className="text-lg font-semibold">{t("Delivery will coming soon")}</p>
                </div>
              </div>
            ))}

            {/* STEP 2.5: Map Picker - Shows when user selects "Drop pin on map" */}
            {selectedZone && selectedLandmark === 'map' && showMapPicker && (
              <Card className="p-6 rounded-2xl shadow-card animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {t("Pin Your Location")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t("Tap the map or drag the marker to your exact location")}
                    </p>
                  </div>
                </div>

                <MapPicker
                  zoneName={selectedZone.name}
                  zoneColor={selectedZone.color}
                  zoneGeometry={selectedZone.geometry}
                  initialCenter={
                    selectedZone.landmarks && selectedZone.landmarks.length > 0
                      ? {
                        lat: selectedZone.landmarks[0].coordinates.lat,
                        lng: selectedZone.landmarks[0].coordinates.lng
                      }
                      : undefined
                  }
                  onLocationSelect={(coords) => {
                    setManualCoordinates(coords);
                  }}
                  selectedCoordinates={manualCoordinates || undefined}
                />
              </Card>
            )}

            {/* STEP 3: Delivery Address */}
            {selectedZone && selectedLandmark !== null && (selectedLandmark !== 'map' || manualCoordinates) && (
              <Card className="p-6 rounded-2xl shadow-card animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {t("Step 3: Complete Address")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t("Provide detailed delivery instructions")}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Selected Zone Summary */}
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{t("Delivering to")}:</p>
                        <p className="font-semibold">{selectedZone.name}</p>
                        {deliveryInfo.landmarkName && selectedLandmark !== 'none' && selectedLandmark !== 'map' && (
                          <p className="text-sm text-primary">
                            📍 {selectedZone.landmarks?.find(l => l.name === deliveryInfo.landmarkName)?.name}
                          </p>
                        )}
                        {selectedLandmark === 'map' && manualCoordinates && (
                          <p className="text-sm text-primary">
                            🎯 {t("Pin-dropped location")}
                          </p>
                        )}
                      </div>
                      <span
                        className="px-3 py-1 rounded-full text-white text-sm font-semibold"
                        style={{ backgroundColor: selectedZone.color }}
                      >
                        {selectedZone.code}
                      </span>
                    </div>
                  </div>

                  {/* Coordinate Resolution Info */}
                  <div className={`p-3 rounded-lg border-2 ${(deliveryInfo.landmarkName && selectedLandmark !== 'none') || (selectedLandmark === 'map' && manualCoordinates)
                    ? 'bg-green-50 border-green-200'
                    : deliveryInfo.additionalNotes.length > 10
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-orange-50 border-orange-200'
                    }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{coordinateInfo.icon}</span>
                      <div>
                        <p className={`text-sm font-medium ${coordinateInfo.color}`}>
                          {coordinateInfo.text}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {coordinateInfo.confidence}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">{t("Full Address")} *</Label>
                    <Textarea
                      id="address"
                      placeholder={"Ex: House #25, blue gate, opposite pharmacy\nNear the big mango tree"}
                      value={deliveryInfo.additionalNotes}
                      onChange={(e) => setDeliveryInfo(prev => ({ ...prev, additionalNotes: e.target.value }))}
                      className="mt-2"
                      rows={4}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("Be specific: house color, landmarks, access instructions")}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* STEP 4: Contact Information */}
            {selectedZone && selectedLandmark !== null && (selectedLandmark !== 'map' || manualCoordinates) && deliveryInfo.additionalNotes && (
              <Card className="p-6 rounded-2xl shadow-card animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {t("Step 4: Contact Information")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t("So we can reach you for delivery")}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contact">{t("Phone Number")} *</Label>
                    <Input
                      id="contact"
                      type="tel"
                      placeholder="+1 XXX XXX XXX"
                      value={deliveryInfo.deliveryContact}
                      onChange={(e) => setDeliveryInfo(prev => ({ ...prev, deliveryContact: e.target.value }))}
                      className="mt-2"
                      required
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <Card className="p-6 rounded-2xl shadow-card">
                <h2 className="text-xl font-semibold mb-4">{t("Order Summary")}</h2>

                <div className="space-y-3 mb-4">
                  {cart.items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {item.product.images?.[0] && (
                          <OptimizedImage
                            src={item.product.images[0].url}
                            alt={item.product.title}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.product.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("Qty")}: {item.quantity}
                        </p>
                        <p className="text-sm font-semibold">
                          {t.formatAmount(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("Subtotal")}</span>
                    <span className="font-medium">{t.formatAmount(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("Delivery Fee")}</span>
                    <span className="font-medium">
                      {selectedZone ? t.formatAmount(deliveryFee) : '-'}
                    </span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg font-bold">
                  <span>{t("Total")}</span>
                  <span className="text-primary">{t.formatAmount(total)}</span>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={!canPlaceOrder() || isSubmitting}
                  className="w-full mt-6 bg-primary hover:bg-[#089808]"
                  size="lg"
                >
                  {isSubmitting ? t("Placing Order...") : t("Place Order")}
                </Button>

                {!canPlaceOrder() && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    {!selectedZone && t("Please select a delivery zone")}
                    {selectedZone && selectedLandmark === null && t("Please choose a location method")}
                    {selectedZone && selectedLandmark === 'map' && !manualCoordinates && t("Please drop a pin on the map")}
                    {selectedZone && selectedLandmark !== null && (selectedLandmark !== 'map' || manualCoordinates) && !deliveryInfo.additionalNotes && t("Please enter the specific address")}
                    {selectedZone && selectedLandmark !== null && (selectedLandmark !== 'map' || manualCoordinates) && deliveryInfo.additionalNotes && !deliveryInfo.deliveryContact && t("Please enter the delivery phone number")}
                  </p>
                )}
              </Card>

              <Card className="p-6 rounded-2xl shadow-card">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">{t("Secure Checkout")}</h3>
                    <p className="text-xs text-muted-foreground">
                      {t("Your information is protected and encrypted")}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCheckout;