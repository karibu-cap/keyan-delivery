/**
 * Shared type definitions for merchant dashboard
 */

import type { Media, OrderStatus, ProductStatus } from '@prisma/client';

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    title: string;
    images: Array<Media>;
  };
}

export interface Order {
  id: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  orderPrices: {
    total: number;
    subtotal: number;
    deliveryFee: number;
  };
  items: OrderItem[];
  user: {
    name: string;
    phone: string;
  };
  deliveryInfo: {
    address: string;
    deliveryContact: string;
  };
  pickupCode?: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  stock: number;
  status: ProductStatus;
  images: Array<Media>;
}

export interface DashboardStats {
  totalProducts: number;
  monthlyRevenue: number;
  ordersToday: number;
  storeRating: number;
  activeProductsCount: number;
  completedOrdersCount: number;
  pendingCount: number;
}

export interface DashboardData {
  activeOrders: Order[];
  historyOrders: Order[];
  products: Product[];
  pendingCount: number;
  totalProducts: number;
}
