// components/driver/profile/DriverDocumentsPreview.tsx
// Documents preview with Approved badge

"use client";

import { Card } from '@/components/ui/card';
import { FileText, CheckCircle } from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';
import Image from 'next/image';

interface DriverDocumentsPreviewProps {
    driverId: string;
}

export default function DriverDocumentsPreview({ driverId }: DriverDocumentsPreviewProps) {
    const t = useT();

    // Mock data - replace with real data from API
    const documents = {
        idCard: {
            url: '/placeholder-id-card.jpg',
            verified: true,
        },
        driverLicense: {
            url: '/placeholder-license.jpg',
            verified: true,
        },
    };

    return (
        <Card className="p-6 rounded-2xl shadow-card">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {t('Documents')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ID Card */}
                <div className="space-y-3">
                    <h3 className="font-medium">{t('ID Card')}</h3>
                    <div className="relative aspect-[3/2] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {documents.idCard.url ? (
                            <>
                                <Image
                                    src={documents.idCard.url}
                                    alt="ID Card"
                                    fill
                                    className="object-cover"
                                />
                                {documents.idCard.verified && (
                                    <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium shadow-lg">
                                        <CheckCircle className="w-4 h-4" />
                                        {t('Approved')}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <FileText className="w-12 h-12 text-gray-400" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Driver License */}
                <div className="space-y-3">
                    <h3 className="font-medium">{t('Driver License')}</h3>
                    <div className="relative aspect-[3/2] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {documents.driverLicense.url ? (
                            <>
                                <Image
                                    src={documents.driverLicense.url}
                                    alt="Driver License"
                                    fill
                                    className="object-cover"
                                />
                                {documents.driverLicense.verified && (
                                    <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium shadow-lg">
                                        <CheckCircle className="w-4 h-4" />
                                        {t('Approved')}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <FileText className="w-12 h-12 text-gray-400" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
