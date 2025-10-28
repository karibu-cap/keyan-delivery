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
  newMerchant: '/new-merchant',


  // Auth routes
  signIn: ({ redirect }: { redirect?: string }) => `/sign-in${redirect ? `?redirect=${redirect}` : ''}`,
  signup: ({ redirect }: { redirect?: string }) => `/sign-up${redirect ? `?redirect=${redirect}` : ''}`,
  profile: '/profile',

  // Customer/Client routes
  orders: '/orders',
  order: (id: string) => `/orders/${id}`,
  wishlist: '/wishlist',
  clientWallet: '/client/wallet',
  clientWalletWithdrawal: '/client/wallet/withdrawal',

  // Merchant routes
  merchantDashboard: (id: string) => `/merchant/${id}`,
  merchantProductNew: '/merchant/new',
  merchantProductEdit: (id: string) => `/merchant/${id}/products`,
  merchantWallet: (id: string) => `/merchant/${id}/wallet`,
  merchantWalletWithdrawal: (id: string) => `/merchant/${id}/wallet/withdrawal`,
  merchantProfile: (id: string) => `/merchant/${id}/profile`,
  merchantInsights: (id: string) => `/merchant/${id}/insights`,
  merchantUnauthorized: (id: string) => `/merchant/${id}/unauthorized`,

  // Driver routes
  driverApply: '/driver/apply',
  driverDashboard: '/driver/dashboard',
  driverOrderDetails: (id: string) => `/driver/order/${id}`,
  driverEarnings: '/driver/earnings',
  driverWallet: '/driver/wallet',
  driverWalletWithdrawal: '/driver/wallet/withdrawal',
  driverInsights: '/driver/insights',
  driverProfile: '/driver/profile',
  driverReview: '/driver/review',


  // Admin routes
  adminDashboard: '/admin',
  adminMerchants: '/admin/merchants',
  adminMerchant: (id: string) => `/admin/merchants/${id}`,
  adminProducts: '/admin/products',
  adminProduct: (id: string) => `/admin/products/${id}`,
  adminDrivers: '/admin/drivers',
  adminDriver: (id: string) => `/admin/drivers/${id}`,
  adminOrders: '/admin/orders',
  adminUsers: '/admin/users',
  adminZones: '/admin/zones',
  adminZone: (id: string) => `/admin/zones/${id}`,
  adminInsights: '/admin/insights',
  adminNotifications: '/admin/notifications',
  adminSettings: '/admin/settings',
  adminUnauthorized: '/admin/unauthorized',
} as const;

export type RouteKey = keyof typeof ROUTES;


