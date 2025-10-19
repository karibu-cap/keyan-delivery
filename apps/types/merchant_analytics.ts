import type { Prisma } from "@prisma/client";


export interface DailyAnalytics {
    date: Date;
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    canceledOrders: number;
    rejectedOrders: number;
    pendingOrders: number;
    averageOrderValue: number;
    newCustomers: number;
    returningCustomers: number;
  }
  
  export interface MerchantStats {
    totalRevenue: number;
    revenueChange: number;
    totalOrders: number;
    ordersChange: number;
    completedOrders: number;
    completionRate: number;
    averageOrderValue: number;
    avgOrderChange: number;
    canceledOrders: number;
    cancelRate: number;
  }
  
  export interface TopProduct {
    productId: string;
    name: string;
    image: string | null;
    quantity: number;
    revenue: number;
    orders: number;
    category?: string;
  }
  
  export interface CustomerInsight {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    averageOrdersPerCustomer: number;
  }
  
  export interface OrderStatusBreakdown {
    completed: number;
    pending: number;
    canceled: number;
    rejected: number;
    inPreparation: number;
    readyToDeliver: number;
    onTheWay: number;
  }
  
  export interface MerchantAnalytics {
    dailyData: DailyAnalytics[];
    stats: MerchantStats;
    topProducts: TopProduct[];
    customerInsights: CustomerInsight;
    orderStatusBreakdown: OrderStatusBreakdown;
    peakHours: { hour: number; orders: number }[];
  }

export type IOrderAnalytics = Prisma.OrderGetPayload<{
  include: {
    items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              images: true,
              categories: {
                include: {
                  category: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          createdAt: true,
        },
      },
    
  }

}>