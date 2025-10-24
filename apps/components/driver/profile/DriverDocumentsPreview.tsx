// components/driver/profile/DriverDocumentsPreview.tsx
// Documents preview with real data from database

"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';
import { ImageDocumentPreview } from './ImageDocumentPreview';
import { Skeleton } from '@/components/ui/skeleton';
import { DriverStatus } from '@prisma/client';

interface DriverDocumentsPreviewProps {
    driverId: string;
}

interface DocumentData {
    cni?: string | null;
    driverDocument?: string | null;
    driverStatus?: DriverStatus | null;
}

export default function DriverDocumentsPreview({ driverId }: DriverDocumentsPreviewProps) {
    const t = useT();
    const [documents, setDocuments] = useState<DocumentData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await fetch(`/api/v1/driver/profile/documents`);
                const data = await response.json();
                setDocuments(data);
            } catch (error) {
                console.error('Failed to fetch documents:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, [driverId]);

    if (loading) {
        return (
            <Card className="p-6 rounded-2xl shadow-card">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    {t('Documents')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="aspect-[3/2] rounded-lg" />
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    const hasDocuments = documents?.cni || documents?.driverDocument;

    return (
        <Card className="p-6 rounded-2xl shadow-card">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {t('Documents')}
            </h2>

            {!hasDocuments ? (
                <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                        {t('No documents uploaded yet')}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ID Card */}
                    {documents.cni && (
                        <div className="space-y-3">
                            <h3 className="font-medium">{t('ID Card')}</h3>
                            <ImageDocumentPreview
                                document={{
                                    id: 'cni',
                                    name: t('ID Card'),
                                    url: documents.cni,
                                    status: documents.driverStatus === DriverStatus.APPROVED ? 'approved' : documents.driverStatus === DriverStatus.PENDING ? 'pending' : documents.driverStatus === DriverStatus.REJECTED ? 'rejected' : 'banned',
                                }}
                            />
                        </div>
                    )}

                    {/* Driver License */}
                    {documents.driverDocument && (
                        <div className="space-y-3">
                            <h3 className="font-medium">{t('Driver License')}</h3>
                            <ImageDocumentPreview
                                document={{
                                    id: 'driverDocument',
                                    name: t('Driver License'),
                                    url: documents.driverDocument,
                                    status: documents.driverStatus === DriverStatus.APPROVED ? 'approved' : documents.driverStatus === DriverStatus.PENDING ? 'pending' : documents.driverStatus === DriverStatus.REJECTED ? 'rejected' : 'banned',
                                }}
                            />
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}
