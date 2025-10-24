'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ZoneDrawMap } from '@/components/admin/zones/ZoneDrawMap';
import { LandmarkManager } from '@/components/admin/zones/LandmarkManager';
import { createZone } from '@/lib/actions/server/admin/zones';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { ZoneCode, ZoneStatus, type Landmark } from '@prisma/client';
import Link from 'next/link';
import { useT } from '@/hooks/use-inline-translation';

const ZONE_CODES = Object.values(ZoneCode);
const ZONE_STATUSES = Object.values(ZoneStatus);

const PRESET_COLORS = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Orange', value: '#f59e0b' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Emerald', value: '#059669' },
];

export default function NewZonePage() {
    const router = useRouter();
    const { toast } = useToast();
    const t = useT();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        code: '' as ZoneCode,
        description: '',
        deliveryFee: 0,
        estimatedDeliveryMinutes: 30,
        minOrderAmount: 0,
        color: '#3b82f6',
        priority: 0,
        status: 'ACTIVE' as ZoneStatus,
        geometry: {
            type: 'Polygon',
            coordinates: [[]] as number[][][],
        },
        landmarks: [] as Landmark[],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            toast({
                variant: 'destructive',
                title: t('Error'),
                description: t('Zone name is required'),
            });
            return;
        }

        if (!formData.code) {
            toast({
                variant: 'destructive',
                title: t('Error'),
                description: t('Zone code is required'),
            });
            return;
        }

        if (formData.geometry.coordinates[0].length < 3) {
            toast({
                variant: 'destructive',
                title: t('Error'),
                description: t('Please draw a zone boundary on the map'),
            });
            return;
        }

        if (formData.deliveryFee < 0) {
            toast({
                variant: 'destructive',
                title: t('Error'),
                description: t('Delivery fee cannot be negative'),
            });
            return;
        }

        setIsSubmitting(true);

        try {
            await createZone(formData);
            toast({
                title: t('Zone created'),
                description: t('The delivery zone has been successfully created'),
            });
            router.push('/admin/zones');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: t('Error'),
                description: error.message || t('Failed to create zone'),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/admin/zones">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">{t('Create Delivery Zone')}</h1>
                        <p className="text-muted-foreground mt-1">
                            {t('Define a new delivery zone with boundaries, pricing, and landmarks')}
                        </p>
                    </div>
                </div>

                {/* Basic Information */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">{t('Basic Information')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="name">{t('Zone Name')} *</Label>
                            <Input
                                id="name"
                                placeholder={t("e.g., Downtown, Central Zone")}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="code">{t('Zone Code')} *</Label>
                            <Select
                                value={formData.code}
                                onValueChange={(value) => setFormData({ ...formData, code: value as ZoneCode })}
                                required
                            >
                                <SelectTrigger id="code">
                                    <SelectValue placeholder={t("Select zone code")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {ZONE_CODES.map((code) => (
                                        <SelectItem key={code} value={code}>
                                            {code}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-2">
                            <Label htmlFor="description">{t('Description')} ({t('Optional')})</Label>
                            <Textarea
                                id="description"
                                placeholder={t("Brief description of the zone coverage area...")}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                    </div>
                </Card>

                {/* Pricing & Settings */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">{t('Pricing & Settings')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <Label htmlFor="deliveryFee">{t('Delivery Fee')} ($) *</Label>
                            <Input
                                id="deliveryFee"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={formData.deliveryFee || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, deliveryFee: parseFloat(e.target.value) || 0 })
                                }
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="estimatedTime">{t('Est. Delivery Time')} ({t('minutes')})</Label>
                            <Input
                                id="estimatedTime"
                                type="number"
                                min="0"
                                placeholder="30"
                                value={formData.estimatedDeliveryMinutes || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        estimatedDeliveryMinutes: parseInt(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="minOrderAmount">{t('Min Order Amount')} ($)</Label>
                            <Input
                                id="minOrderAmount"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={formData.minOrderAmount || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) || 0 })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="priority">{t('Priority')} ({t('higher = more important')})</Label>
                            <Input
                                id="priority"
                                type="number"
                                min="0"
                                placeholder="0"
                                value={formData.priority || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="status">{t('Status')}</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value as ZoneStatus })}
                            >
                                <SelectTrigger id="status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ZONE_STATUSES.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="color">{t('Zone Color')}</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="color"
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="w-20 h-10 cursor-pointer"
                                />
                                <Select
                                    value={formData.color}
                                    onValueChange={(value) => setFormData({ ...formData, color: value })}
                                >
                                    <SelectTrigger className="flex-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PRESET_COLORS.map((preset) => (
                                            <SelectItem key={preset.value} value={preset.value}>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 rounded-full"
                                                        style={{ backgroundColor: preset.value }}
                                                    />
                                                    {t(preset.name)}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Zone Boundary */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">{t('Zone Boundary')}</h2>
                    <ZoneDrawMap
                        initialGeometry={formData.geometry}
                        onGeometryChange={(geometry) => setFormData({ ...formData, geometry })}
                    />
                </div>

                {/* Landmarks */}
                <div>
                    <LandmarkManager
                        landmarks={formData.landmarks}
                        onChange={(landmarks) => setFormData({ ...formData, landmarks })}
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 justify-end">
                    <Link href="/admin/zones">
                        <Button variant="outline" type="button">
                            {t('Cancel')}
                        </Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t('Creating...')}
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                {t('Create Zone')}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </>
    );
}