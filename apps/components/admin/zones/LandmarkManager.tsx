'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { MapPin, Plus, Trash2, Edit2, Loader2, Star } from 'lucide-react';
import { geocodeAddress } from '@/lib/actions/server/admin/zones';
import { useToast } from '@/hooks/use-toast';
import type { Landmark } from '@prisma/client';
import { useT } from '@/hooks/use-inline-translation';

interface LandmarkManagerProps {
    landmarks: Landmark[];
    onChange: (landmarks: Landmark[]) => void;
}

const LANDMARK_CATEGORIES = [
    'supermarket',
    'station',
    'market',
    'restaurant',
    'hospital',
    'school',
    'church',
    'mosque',
    'park',
    'neighborhood',
    'general',
];

export function LandmarkManager({ landmarks, onChange }: LandmarkManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const { toast } = useToast();
    const t = useT();

    const [newLandmark, setNewLandmark] = useState({
        name: '',
        address: '',
        category: 'general',
        isPopular: false,
    });

    const handleGeocode = async () => {
        if (!newLandmark.address.trim()) {
            toast({
                variant: 'destructive',
                title: t('Error'),
                description: t('Please enter an address'),
            });
            return;
        }

        setIsGeocoding(true);
        try {
            const coordinates = await geocodeAddress(newLandmark.address);
            if (!coordinates) {
                toast({
                    variant: 'destructive',
                    title: t('Geocoding failed'),
                    description: t('Could not find coordinates for this address. Try a more specific address.'),
                });
                return;
            }

            const landmark: Landmark = {
                name: newLandmark.name || newLandmark.address,
                coordinates,
                category: newLandmark.category,
                isPopular: newLandmark.isPopular,
            };

            if (editingIndex !== null) {
                // Update existing landmark
                const updated = [...landmarks];
                updated[editingIndex] = landmark;
                onChange(updated);
                setEditingIndex(null);
                toast({
                    title: t('Landmark updated'),
                    description: t('The landmark has been successfully updated'),
                });
            } else {
                // Add new landmark
                onChange([...landmarks, landmark]);
                toast({
                    title: t('Landmark added'),
                    description: t('The landmark has been successfully added'),
                });
            }

            // Reset form
            setNewLandmark({
                name: '',
                address: '',
                category: 'general',
                isPopular: false,
            });
            setIsAdding(false);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: t('Error'),
                description: t('Failed to geocode address. Please try again.'),
            });
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleDelete = (index: number) => {
        const updated = landmarks.filter((_, i) => i !== index);
        onChange(updated);
        toast({
            title: t('Landmark deleted'),
            description: t('The landmark has been removed'),
        });
    };

    const handleEdit = (index: number) => {
        const landmark = landmarks[index];
        setNewLandmark({
            name: landmark.name,
            address: `${landmark.coordinates.lat}, ${landmark.coordinates.lng}`,
            category: landmark.category || 'general',
            isPopular: landmark.isPopular,
        });
        setEditingIndex(index);
        setIsAdding(true);
    };

    return (
        <Card className="p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">{t('Landmarks')}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t('Add landmarks to help customers specify delivery locations')}
                        </p>
                    </div>
                    {!isAdding && (
                        <Button onClick={() => setIsAdding(true)} variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            {t('Add Landmark')}
                        </Button>
                    )}
                </div>

                {/* Add/Edit Landmark Form */}
                {isAdding && (
                    <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="landmark-name">{t('Landmark Name')} *</Label>
                                <Input
                                    id="landmark-name"
                                    placeholder={t("e.g., Central Market, Main Station")}
                                    value={newLandmark.name}
                                    onChange={(e) => setNewLandmark({ ...newLandmark, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="landmark-category">{t('Category')}</Label>
                                <Select
                                    value={newLandmark.category}
                                    onValueChange={(value) => setNewLandmark({ ...newLandmark, category: value })}
                                >
                                    <SelectTrigger id="landmark-category">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LANDMARK_CATEGORIES.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {t(cat.charAt(0).toUpperCase() + cat.slice(1))}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="landmark-address">{t('Address')} *</Label>
                            <Input
                                id="landmark-address"
                                placeholder={t("e.g., Rue 1234, Yaoundé or coordinates (lat, lng)")}
                                value={newLandmark.address}
                                onChange={(e) => setNewLandmark({ ...newLandmark, address: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('Enter a full address or coordinates. The system will geocode it automatically.')}
                            </p>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="landmark-popular"
                                checked={newLandmark.isPopular}
                                onCheckedChange={(checked) =>
                                    setNewLandmark({ ...newLandmark, isPopular: checked as boolean })
                                }
                            />
                            <Label htmlFor="landmark-popular" className="text-sm font-normal cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    {t('Mark as popular (will appear first in customer selection)')}
                                </div>
                            </Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleGeocode}
                                disabled={isGeocoding || !newLandmark.address.trim()}
                                className="bg-primary hover:bg-primary/90"
                            >
                                {isGeocoding ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t('Geocoding...')}
                                    </>
                                ) : (
                                    <>
                                        <MapPin className="w-4 h-4 mr-2" />
                                        {editingIndex !== null ? t('Update Landmark') : t('Add Landmark')}
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsAdding(false);
                                    setEditingIndex(null);
                                    setNewLandmark({
                                        name: '',
                                        address: '',
                                        category: 'general',
                                        isPopular: false,
                                    });
                                }}
                            >
                                {t('Cancel')}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Landmarks List */}
                {landmarks.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('Name')}</TableHead>
                                    <TableHead>{t('Category')}</TableHead>
                                    <TableHead>{t('Coordinates')}</TableHead>
                                    <TableHead>{t('Popular')}</TableHead>
                                    <TableHead className="text-right">{t('Actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {landmarks.map((landmark, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-primary" />
                                                <span className="font-medium">{landmark.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {t((landmark.category || 'general').charAt(0).toUpperCase() + (landmark.category || 'general').slice(1))}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-xs bg-muted px-2 py-1 rounded">
                                                {landmark.coordinates.lat.toFixed(6)}, {landmark.coordinates.lng.toFixed(6)}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            {landmark.isPopular && (
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(index)}>
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(index)}
                                                >
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{t('No landmarks added yet')}</p>
                        <p className="text-sm">{t('Add landmarks to help customers specify their delivery location')}</p>
                    </div>
                )}
            </div>
        </Card>
    );
}