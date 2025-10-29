// File: /app/[locale]/(driver)/driver/dashboard/page.tsx
// Driver dashboard - Server Component with metadata

import { Metadata } from 'next';
import DriverDashboardClient from "@/components/driver/DriverDashboardClient";

export const metadata: Metadata = {
   title: 'Dashboard | Yetu Driver',
   description: 'Manage your deliveries, track earnings, and view available orders on your driver dashboard.',
   keywords: ['driver dashboard', 'deliveries', 'orders', 'earnings', 'yetu driver'],
   openGraph: {
      title: 'Driver Dashboard | Yetu',
      description: 'Manage your deliveries and track your earnings',
      type: 'website',
   },
};

type Props = {
   searchParams: Promise<{ tab?: string }>;
};

export default async function DriverDashboardPage({ searchParams }: Props) {
   const params = await searchParams;
   return <DriverDashboardClient initialTab={params.tab} />;
}
