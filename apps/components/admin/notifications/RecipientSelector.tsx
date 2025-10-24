'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getAllMerchants, RecipientType } from '@/lib/actions/server/admin/messaging';
import { MerchantType } from '@prisma/client';
import { useT } from '@/hooks/use-inline-translation';
import { Users, Search, Store, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface RecipientSelectorProps {
    recipientType: RecipientType;
    merchantType?: MerchantType;
    specificMerchantIds: string[];
    onRecipientTypeChange: (type: RecipientType) => void;
    onMerchantTypeChange: (type: MerchantType) => void;
    onSpecificMerchantsChange: (ids: string[]) => void;
}

export function RecipientSelector({
    recipientType,
    merchantType,
    specificMerchantIds,
    onRecipientTypeChange,
    onMerchantTypeChange,
    onSpecificMerchantsChange,
}: RecipientSelectorProps) {
    const t = useT();
    const [merchants, setMerchants] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (recipientType === RecipientType.SPECIFIC) {
            loadMerchants();
        }
    }, [recipientType]);

    const loadMerchants = async () => {
        setIsLoading(true);
        try {
            const data = await getAllMerchants();
            setMerchants(data);
        } catch (error) {
            console.error('Failed to load merchants:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredMerchants = merchants.filter((merchant) =>
        merchant.businessName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleMerchantToggle = (merchantId: string) => {
        if (specificMerchantIds.includes(merchantId)) {
            onSpecificMerchantsChange(specificMerchantIds.filter((id) => id !== merchantId));
        } else {
            onSpecificMerchantsChange([...specificMerchantIds, merchantId]);
        }
    };

    const recipientOptions = [
        {
            value: RecipientType.ALL,
            label: t('All Merchants'),
            description: t('Send to all registered merchants'),
            icon: Users,
        },
        {
            value: RecipientType.VERIFIED,
            label: t('Verified Merchants'),
            description: t('Only verified and active merchants'),
            icon: CheckCircle,
        },
        {
            value: RecipientType.UNVERIFIED,
            label: t('Unverified Merchants'),
            description: t('Merchants pending verification'),
            icon: AlertCircle,
        },
        {
            value: RecipientType.BY_TYPE,
            label: t('By Merchant Type'),
            description: t('Filter by business category'),
            icon: Store,
        },
        {
            value: RecipientType.SPECIFIC,
            label: t('Specific Merchants'),
            description: t('Select individual merchants'),
            icon: Users,
        },
    ];

    return (
        <div className="space-y-4">
            <Label className="text-base">{t('Select Recipients')}</Label>

            {/* Recipient Type Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recipientOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = recipientType === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onRecipientTypeChange(option.value)}
                            className={`p-4 border-2 rounded-lg text-left transition-all ${isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <Icon className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium mb-1">{option.label}</p>
                                    <p className="text-xs text-muted-foreground">{option.description}</p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Merchant Type Selector */}
            {recipientType === RecipientType.BY_TYPE && (
                <div>
                    <Label htmlFor="merchantType">{t('Select Merchant Type')}</Label>
                    <Select
                        value={merchantType}
                        onValueChange={(value) => onMerchantTypeChange(value as MerchantType)}
                    >
                        <SelectTrigger id="merchantType">
                            <SelectValue placeholder={t("Choose merchant type...")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={MerchantType.FOOD}>
                                {t('Food')} - {t('Restaurants & Cafes')}
                            </SelectItem>
                            <SelectItem value={MerchantType.GROCERY}>
                                {t('Grocery')} - {t('Supermarkets & Stores')}
                            </SelectItem>
                            <SelectItem value={MerchantType.PHARMACY}>
                                {t('Pharmacy')} - {t('Medical & Health')}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Specific Merchants Selector */}
            {recipientType === RecipientType.SPECIFIC && (
                <Card className="p-4">
                    <div className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder={t("Search merchants...")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Selected Count */}
                        {specificMerchantIds.length > 0 && (
                            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                                <span className="text-sm font-medium">
                                    {t('Selected')}: {specificMerchantIds.length} {t('merchants')}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onSpecificMerchantsChange([])}
                                    className="text-sm text-primary hover:underline"
                                >
                                    {t('Clear all')}
                                </button>
                            </div>
                        )}

                        {/* Merchant List */}
                        {isLoading ? (
                            <div className="text-center py-8 text-muted-foreground">
                                {t('Loading merchants...')}
                            </div>
                        ) : filteredMerchants.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                {searchQuery
                                    ? t('No merchants found matching "{query}"', { query: searchQuery })
                                    : t('No merchants available')}
                            </div>
                        ) : (
                            <div className="max-h-[300px] overflow-y-auto space-y-2">
                                {filteredMerchants.map((merchant) => (
                                    <div
                                        key={merchant.id}
                                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <Checkbox
                                            id={merchant.id}
                                            checked={specificMerchantIds.includes(merchant.id)}
                                            onCheckedChange={() => handleMerchantToggle(merchant.id)}
                                        />
                                        <label
                                            htmlFor={merchant.id}
                                            className="flex-1 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium">{merchant.businessName}</p>
                                                {merchant.isVerified && (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Badge variant="secondary" className="text-xs">
                                                    {merchant.merchantType}
                                                </Badge>
                                                {merchant.managers[0]?.user?.email && (
                                                    <span>{merchant.managers[0].user.email}</span>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}