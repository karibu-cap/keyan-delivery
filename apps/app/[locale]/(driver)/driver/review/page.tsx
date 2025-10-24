// File: /app/[locale]/(driver)/driver/review/page.tsx
// Driver review page - Server Component with metadata

import { Metadata } from 'next';
import DriverReviewClient from "@/components/driver/DriverReviewClient";

export const metadata: Metadata = {
   title: 'Application Review | Yetu Driver',
   description: 'Check the status of your driver application and view your submitted documents.',
   keywords: ['driver review', 'application status', 'driver documents', 'yetu driver'],
   openGraph: {
      title: 'Driver Application Review | Yetu',
      description: 'Check your driver application status',
      type: 'website',
   },
};

export default function DriverReviewPage() {
   return <DriverReviewClient />;
}
