// apps/app/lib/router.ts
export const ROUTES = {
  // Public routes
  home: '/',
  products: '/products',
  product: (id: string) => `/product/${id}`,
  merchant: (id: string) => `/merchant/${id}`,
  cart: '/cart',
  checkout: '/checkout',
  search: '/search',
  stores: '/stores',
  newDriver: '/new-driver',
  newMerchant: '/new-merchant',


  // Auth routes
  signIn: '/sign-in',
  signup: '/sign-up',
  profile: '/profile',

  // Customer routes
  orders: '/orders',
  order: (id: string) => `/orders/${id}`,
  wishlist: '/wishlist',

  // Merchant routes
  merchantDashboard: (id: string) => `/merchant/${id}`,
  merchantProducts: '/merchant/products',
  merchantProductNew: '/merchant/products/new',
  merchantProductEdit: (id: string) => `/merchant/products/${id}/edit`,
  merchantOrders: '/merchant/orders',
  merchantStats: '/merchant/stats',
  merchantSettings: '/merchant/settings',

  // Driver routes
  driverDashboard: '/driver',
  driverOrders: '/driver/orders',
  driverEarnings: '/driver/earnings',


  // Admin routes
  adminDashboard: '/admin',
  adminMerchants: '/admin/merchants',
  adminProducts: '/admin/products',
  adminOrders: '/admin/orders',
  adminUsers: '/admin/users',
} as const;

export type RouteKey = keyof typeof ROUTES;