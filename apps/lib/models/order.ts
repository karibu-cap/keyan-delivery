// ---------------- Enums ----------------
export type OrderStatus =
   | "PENDING"
   | "ACCEPTED_BY_MERCHANT"
   | "ACCEPTED_BY_DRIVER"
   | "REJECTED_BY_MERCHANT"
   | "REJECTED_BY_DRIVER"
   | "CANCELED_BY_MERCHANT"
   | "CANCELED_BY_DRIVER"
   | "ON_THE_WAY"
   | "IN_PREPARATION"
   | "READY_TO_DELIVER"
   | "COMPLETED";

// ---------------- Types ----------------
export interface LongLat {
   lat: number;
   lng: number;
}

export interface OrderPrices {
   subtotal: number;
   shipping: number;
   discount: number;
   total: number;
   deliveryFee: number;
}

export interface DriverStatusHistory {
   status: OrderStatus;
   timestamp: string;
}

export interface DriverLocation {
   latitude: number;
   longitude: number;
   timestamp: string;
}

export interface DeliveryInfo {
   address: string;
   location: {
      lng: number;
      lat: number;
   };
   additionalNotes?: string | null;
   deliveryContact?: string | null;
   estimatedDelivery?: Date | null;
   landmark?: {
      name: string;
      coordinates: LongLat;
      category?: string | null;
      isPopular?: boolean;
   } | null;
   coordinateSource?: "LANDMARK" | "GEOCODED" | "ZONE_CENTER" | "MANUAL";
   coordinateConfidence?: "HIGH" | "MEDIUM" | "LOW";
}

export interface Merchant {
   id: string;
   businessName: string;
   slug: string;
   phone: string;
   logoUrl?: string | null;
   bannerUrl?: string | null;
   isVerified: boolean;
   merchantType: "FOOD" | "PHARMACY" | "GROCERY";
   address: {
      latitude: number;
      longitude: number;
   };
   deliveryTime?: string | null;
   rating?: number | null;
}

export interface Product {
   id: string;
   title: string;
   description?: string | null;
   images?: string[] | null;
   price: number;
   unit?: string | null;
}

export interface OrderItem {
   id: string;
   quantity: number;
   price: number;
   product: Product;
}

export interface DriverInfo {
   id?: string;
   fullName?: string;
   phone?: string;
   currentLocation?: LongLat | null;
   lastUpdatedAt?: Date | null;
}

export interface User {
   id: string;
   email: string;
   name: string;
   emailVerified: boolean;
   image: string;
   phone?: string;
}

export interface Order {
   id: string;
   status: OrderStatus;
   createdAt: Date;
   updatedAt: Date;
   pickupCode?: string | null;
   deliveryCode?: string | null;

   // Relations
   merchant: Merchant;
   items: OrderItem[];

   // Delivery details
   deliveryInfo: DeliveryInfo;
   orderPrices: OrderPrices;

   // Tracking / Live updates
   driver?: DriverInfo | null;
   driverCurrentLocation: DriverLocation;
   driverStartDeliveryLocation: DriverLocation;
   driverLocationUpdatedAt: string;
   driverStatusHistories: DriverStatusHistory[];
   driverTotalDistanceInKilometers: number;
   onTimeDelivery: boolean;

   // Additional data
   user: User;
   merchantId: string;
   deliveryZoneId?: string | null;
   paymentId?: string | null;
}