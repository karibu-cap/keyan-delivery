// app/(driver)/driver/profile/page.tsx
// Driver Profile page

import { redirect } from 'next/navigation';
import { getServerT } from '@/i18n/server-translations';
import DriverProfileClient from '@/components/driver/profile/DriverProfileClient';
import { prisma } from '@/lib/prisma';
import { ROUTES } from '@/lib/router';
import { getSession } from '@/lib/auth-server';

export const metadata = {
    title: 'Profile | Driver Dashboard',
    description: 'Manage your driver profile and settings',
};

async function getDriverProfile(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    return user;
}

export default async function DriverProfilePage() {
    const t = await getServerT();
    const session = await getSession();

    if (!session?.user) {
        redirect(ROUTES.signIn({ redirect: ROUTES.driverProfile }));
    }

    const driver = await getDriverProfile(session.user.id);

    if (!driver) {
        redirect(ROUTES.signIn({ redirect: ROUTES.driverProfile }));
    }

    return <DriverProfileClient driver={driver} />;
}
