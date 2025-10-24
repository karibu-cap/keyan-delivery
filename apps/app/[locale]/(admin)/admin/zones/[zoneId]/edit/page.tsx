import { EditZoneForm } from '@/components/admin/zones/EditZoneForm';
import { getZoneById } from '@/lib/actions/server/admin/zones';
import { notFound } from 'next/navigation';

export const metadata = {
    title: 'Edit Delivery Zone | Admin Panel',
    description: 'Edit delivery zone settings and boundaries',
};

interface EditZonePageProps {
    params: Promise<{ zoneId: string }>;
}

export default async function EditZonePage({ params }: EditZonePageProps) {
    const { zoneId } = await params;
    const zone = await getZoneById(zoneId);

    if (!zone) {
        notFound();
    }

    return (
        <>
            <EditZoneForm zone={zone} />
        </>
    );
}