/**
 * Shared type definitions for merchant dashboard
 */

import type { CartItem, Inventory, Media, MerchantAddress, MerchantType, OrderStatus, ProductBadge, ProductPromotion, ProductSeoMetadata, ProductStatus, SavedList, UserMerchantManager, Wallet, Wishlist } from '@prisma/client';

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

export interface IProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  images: Media[];
  categories?: ICategoryOnProduct[] | null;
  price: number;
  compareAtPrice?: number | null;
  inventory?: Inventory | null;
  metadata?: ProductSeoMetadata | null;
  unit?: string | null;
  status: ProductStatus;
  visibility: boolean;
  merchant?: IMerchant | null;
  merchantId: string;
  rating?: number | null
  reviewCount?: number | null
  badges?: ProductBadge[] | null
  weight?: number | null
  weightUnit: string | null
  createdAt: Date
  updatedAt: Date
  OrderItem?: OrderItem[] | null
  userWishlist?: Wishlist[] | null
  creatorId: string
  promotions?: ProductPromotion[] | null
  cartItems?: CartItem[] | null
  SavedList?: SavedList | null
  savedListId?: string | null
  _count?: {
    OrderItem: number;
    cartItems: number;
  } | null;
}

export interface IMerchant {
  id: string
  businessName: string
  slug: string
  phone: string
  logoUrl?: string | null
  bannerUrl?: string | null
  isVerified: boolean
  merchantType: MerchantType
  address: MerchantAddress
  createdAt: Date
  updatedAt: Date
  products?: IProduct[] | null
  managers?: UserMerchantManager[] | null
  deliveryTime?: string | null
  rating?: number | null
  wallet?: Wallet | null
  order?: Order[] | null
}

export interface ICategoryOnProduct {
  id: string;
  productId: string;
  categoryId: string;
  products?: IProduct;
  category?: ICategory;
}

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: Media | null;
  imageId?: string | null;
  products?: ICategoryOnProduct[];
  parentCategoryId?: string | null;
  parentCategory?: ICategory | null;
  subcategories?: ICategory[];
  createdAt: Date;
  updatedAt: Date;
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
  products: IProduct[];
  pendingCount: number;
  totalProducts: number;
}
