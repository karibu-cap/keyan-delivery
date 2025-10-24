import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { getAllZones } from '@/lib/actions/server/admin/zones';
import { getServerT } from '@/i18n/server-translations';
import Link from 'next/link';
import {
    MapPin,
    Plus,
    TrendingUp,
    DollarSign,
    Clock,
    AlertCircle,
} from 'lucide-react';
import { ZoneActionsClient } from '@/components/admin/zones/ZoneActionsClient';

export const metadata = {
    title: 'Delivery Zones | Admin Panel',
    description: 'Manage delivery zones and coverage areas',
};

export default async function AdminZonesPage() {
    const t = await getServerT();
    const zones = await getAllZones();

    // Calculate stats
    const activeZones = zones.filter((z) => z.status === 'ACTIVE').length;
    const totalZones = zones.length;
    const avgDeliveryFee =
        zones.reduce((sum, z) => sum + z.deliveryFee, 0) / (zones.length || 1);

    const stats = [
        {
            label: t('Total Zones'),
            value: totalZones.toString(),
            icon: MapPin,
            color: 'bg-blue-500',
        },
        {
            label: t('Active Zones'),
            value: activeZones.toString(),
            icon: TrendingUp,
            color: 'bg-green-500',
        },
        {
            label: t('Avg Delivery Fee'),
            value: `$${avgDeliveryFee.toFixed(2)}`,
            icon: DollarSign,
            color: 'bg-yellow-500',
        },
        {
            label: t('Inactive Zones'),
            value: (totalZones - activeZones).toString(),
            icon: AlertCircle,
            color: 'bg-gray-500',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">{t('Delivery Zones')}</h1>
                        <p className="text-muted-foreground mt-1">
                            {t('Manage delivery zones, pricing, and coverage areas')}
                        </p>
                    </div>
                    <Link href="/admin/zones/new">
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="w-4 h-4 mr-2" />
                            {t('Add New Zone')}
                        </Button>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                        <Card key={index} className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Zones Table */}
                <Card className="p-0">
                    {zones.length === 0 ? (
                        <div className="p-12 text-center">
                            <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-xl font-semibold mb-2">{t('No Delivery Zones')}</h3>
                            <p className="text-muted-foreground mb-6">
                                {t('Create your first delivery zone to start managing coverage areas')}
                            </p>
                            <Link href="/admin/zones/new">
                                <Button className="bg-primary hover:bg-primary/90">
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t('Create First Zone')}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[200px]">{t('Zone Name')}</TableHead>
                                        <TableHead>{t('Code')}</TableHead>
                                        <TableHead>{t('Delivery Fee')}</TableHead>
                                        <TableHead>{t('Est. Time')}</TableHead>
                                        <TableHead>{t('Min Order')}</TableHead>
                                        <TableHead>{t('Landmarks')}</TableHead>
                                        <TableHead>{t('Status')}</TableHead>
                                        <TableHead className="text-right">{t('Actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {zones.map((zone) => (
                                        <TableRow key={zone.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-4 h-4 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: zone.color || '#gray' }}
                                                    />
                                                    <div>
                                                        <p className="font-medium">{zone.name}</p>
                                                        {zone.description && (
                                                            <p className="text-xs text-muted-foreground line-clamp-1">
                                                                {zone.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono">
                                                    {zone.code}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-medium">{zone.deliveryFee.toFixed(2)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {zone.estimatedDeliveryMinutes ? (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                                        <span>{zone.estimatedDeliveryMinutes}m</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {zone.minOrderAmount ? (
                                                    <span className="font-medium">${zone.minOrderAmount.toFixed(2)}</span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {zone.landmarks?.length || 0} {t('locations')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={zone.status === 'ACTIVE' ? 'default' : 'secondary'}
                                                    className={
                                                        zone.status === 'ACTIVE'
                                                            ? 'bg-green-500 hover:bg-green-600'
                                                            : zone.status === 'MAINTENANCE'
                                                                ? 'bg-yellow-500 hover:bg-yellow-600'
                                                                : 'bg-gray-500 hover:bg-gray-600'
                                                    }
                                                >
                                                    {zone.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <ZoneActionsClient zoneId={zone.id} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}