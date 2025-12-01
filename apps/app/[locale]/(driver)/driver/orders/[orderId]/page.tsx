// File: /app/[locale]/(driver)/driver/order/[orderId]/page.tsx
// Driver order detail page - Server Component with metadata

import { Metadata } from 'next';
import DriverOrderDetailClient from "@/components/driver/DriverOrderDetailClient";

export const metadata: Metadata = {
   title: 'Order Details | Pataupesi Driver',
   description: 'View order details, track delivery progress, and manage your current delivery.',
   keywords: ['order details', 'delivery tracking', 'driver order', 'pataupesi driver'],
   openGraph: {
      title: 'Order Details | Pataupesi Driver',
      description: 'View and manage your delivery order',
      type: 'website',
   },
};

export default function OrderDetailPage() {
   return <DriverOrderDetailClient />;
}