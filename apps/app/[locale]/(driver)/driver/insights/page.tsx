
import DriverInsightsClient from '@/components/driver/insights/DriverInsightsClient';

export const metadata = {
    title: 'Insights & Analytics | Driver Dashboard',
    description: 'Track your performance and earnings',
};

export default async function DriverInsightsPage() {

    return <DriverInsightsClient />;
}
