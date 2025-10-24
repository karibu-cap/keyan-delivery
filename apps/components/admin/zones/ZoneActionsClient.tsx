'use client';

import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteZone } from '@/lib/actions/server/admin/zones';
import { useToast } from '@/hooks/use-toast';
import { useT } from '@/hooks/use-inline-translation';

interface ZoneActionsClientProps {
    zoneId: string;
}

export function ZoneActionsClient({ zoneId }: ZoneActionsClientProps) {
    const router = useRouter();
    const { toast } = useToast();
    const t = useT();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteZone(zoneId);
            toast({
                title: t('Zone deleted'),
                description: t('The delivery zone has been successfully deleted'),
            });
            router.refresh();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: t('Error'),
                description: error.message || t('Failed to delete zone'),
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex items-center justify-end gap-2">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/admin/zones/${zoneId}/edit`)}
            >
                <Edit className="w-4 h-4" />
            </Button>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isDeleting}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('Are you sure?')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t(
                                'This action cannot be undone. This will permanently delete the delivery zone. Zones with existing orders cannot be deleted.'
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting ? t('Deleting...') : t('Delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}