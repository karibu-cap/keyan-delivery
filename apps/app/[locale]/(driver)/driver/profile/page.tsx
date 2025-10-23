// app/(driver)/driver/profile/page.tsx
// Driver Profile page

import { redirect } from 'next/navigation';
import { getServerT } from '@/i18n/server-translations';
import { getUserTokens } from '@/lib/firebase-client/server-firebase-utils';
import DriverProfileClient from '@/components/driver/profile/DriverProfileClient';
import { prisma } from '@/lib/prisma';
import { email } from 'zod';
import { ROUTES } from '@/lib/router';

export const metadata = {
    title: 'Profile | Driver Dashboard',
    description: 'Manage your driver profile and settings',
};

async function getDriverProfile(authId: string) {
    const user = await prisma.user.findUnique({
        where: { authId },
    });

    return user;
}

export default async function DriverProfilePage() {
    const t = await getServerT();
    const tokens = await getUserTokens();
    const authId = tokens?.decodedToken.uid;
    
    if (!authId) {
        redirect(ROUTES.signIn);
    }

    const driver = await getDriverProfile(authId);

    if (!driver) {
        redirect(ROUTES.signIn);
    }

    return <DriverProfileClient driver={driver} />;
}
