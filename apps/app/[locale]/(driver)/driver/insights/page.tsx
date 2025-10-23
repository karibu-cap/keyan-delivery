// app/(driver)/driver/insights/page.tsx
// Driver Insights & Analytics page with date range picker

import { redirect } from 'next/navigation';
import { getServerT } from '@/i18n/server-translations';
import { getUserTokens } from '@/lib/firebase-client/server-firebase-utils';
import DriverInsightsClient from '@/components/driver/insights/DriverInsightsClient';
import { ROUTES } from '@/lib/router';

export const metadata = {
    title: 'Insights & Analytics | Driver Dashboard',
    description: 'Track your performance and earnings',
};

export default async function DriverInsightsPage() {
    const tokens = await getUserTokens();
    const authId = tokens?.decodedToken.uid;
    
    if (!authId) {
        redirect(ROUTES.signIn);
    }

    return <DriverInsightsClient />;
}
