// File: /app/[locale]/(driver)/driver/apply/page.tsx
// Driver application page - Server Component with metadata

import { Metadata } from 'next';
import DriverApplyClient from "@/components/driver/DriverApplyClient";

export const metadata: Metadata = {
   title: 'Apply as Driver | Pataupesi',
   description: 'Join Pataupesi as a delivery driver. Upload your documents and start earning with flexible delivery opportunities.',
   keywords: ['driver application', 'become a driver', 'delivery driver', 'earn money', 'pataupesi driver'],
   openGraph: {
      title: 'Become a Pataupesi Driver',
      description: 'Join our team of drivers and start earning today',
      type: 'website',
   },
};

export default function DriverApplicationPage() {
   return <DriverApplyClient />;
}
