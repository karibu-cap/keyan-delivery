'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    sendMessage,
} from '@/lib/actions/client/admin/messaging';
import { useToast } from '@/hooks/use-toast';
import { useT } from '@/hooks/use-inline-translation';
import {
    Bell,
    Mail,
    MessageSquare,
    Send,
    Loader2,
    Eye,
    Sparkles,
    Users,
} from 'lucide-react';
import { MerchantType } from '@prisma/client';
import { RecipientSelector } from './RecipientSelector';
import { MessagePreview } from './MessagePreview';
import { TemplateSelector } from './TemplateSelector';
import { RecipientType, MessageChannel } from '@/types/messaging';

interface MessageComposerProps {
    merchantStats: {
        total: number;
        verified: number;
        unverified: number;
        byType: Record<string, number>;
    };
}

export function MessageComposer({ merchantStats }: MessageComposerProps) {
    const { toast } = useToast();
    const t = useT();
    const [isSending, setIsSending] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const [formData, setFormData] = useState({
        channel: MessageChannel.PUSH,
        recipientType: RecipientType.ALL,
        specificMerchantIds: [] as string[],
        merchantType: undefined as MerchantType | undefined,
        title: '',
        body: '',
        url: '',
    });

    // Calculate recipient count
    const getRecipientCount = () => {
        switch (formData.recipientType) {
            case RecipientType.ALL:
                return merchantStats.total;
            case RecipientType.VERIFIED:
                return merchantStats.verified;
            case RecipientType.UNVERIFIED:
                return merchantStats.unverified;
            case RecipientType.BY_TYPE:
                return formData.merchantType
                    ? merchantStats.byType[formData.merchantType] || 0
                    : 0;
            case RecipientType.SPECIFIC:
                return formData.specificMerchantIds.length;
            default:
                return 0;
        }
    };

    const recipientCount = getRecipientCount();

    // Channel options
    const channels = [
        { value: MessageChannel.PUSH, label: t('Push Notification'), icon: Bell, color: 'text-blue-500' },
        { value: MessageChannel.SMS, label: t('SMS'), icon: MessageSquare, color: 'text-green-500' },
        { value: MessageChannel.EMAIL, label: t('Email'), icon: Mail, color: 'text-purple-500' },
        { value: MessageChannel.ALL, label: t('All Channels'), icon: Sparkles, color: 'text-orange-500' },
    ];

    const handleTemplateSelect = (template: any) => {
        setFormData({
            ...formData,
            title: template.title,
            body: template.body,
            channel: template.channel,
        });
        toast({
            title: t('Template loaded'),
            description: t('You can now customize the message'),
        });
    };

    const handleSendClick = () => {
        // Validation
        if (!formData.title.trim()) {
            toast({
                variant: 'destructive',
                title: t('Error'),
                description: t('Message title is required'),
            });
            return;
        }

        if (!formData.body.trim()) {
            toast({
                variant: 'destructive',
                title: t('Error'),
                description: t('Message body is required'),
            });
            return;
        }

        if (recipientCount === 0) {
            toast({
                variant: 'destructive',
                title: t('Error'),
                description: t('No recipients selected'),
            });
            return;
        }

        if (formData.recipientType === RecipientType.BY_TYPE && !formData.merchantType) {
            toast({
                variant: 'destructive',
                title: t('Error'),
                description: t('Please select a merchant type'),
            });
            return;
        }

        if (formData.recipientType === RecipientType.SPECIFIC && formData.specificMerchantIds.length === 0) {
            toast({
                variant: 'destructive',
                title: t('Error'),
                description: t('Please select at least one merchant'),
            });
            return;
        }

        setShowConfirmDialog(true);
    };

    const handleConfirmSend = async () => {
        setShowConfirmDialog(false);
        setIsSending(true);

        try {
            const result = await sendMessage(formData);

            if (result.success) {
                toast({
                    title: t('Messages sent successfully'),
                    description: t('Sent to {count} recipients', { count: result.results.sent }),
                });

                // Reset form
                setFormData({
                    channel: MessageChannel.PUSH,
                    recipientType: RecipientType.ALL,
                    specificMerchantIds: [],
                    merchantType: undefined,
                    title: '',
                    body: '',
                    url: '',
                });
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: t('Failed to send messages'),
                description: error.message || t('Please try again'),
            });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="space-y-6">
                    {/* Header */}
                    <div>
                        <h2 className="text-2xl font-bold mb-2">{t('Compose Message')}</h2>
                        <p className="text-muted-foreground">
                            {t('Send notifications to merchants via push, SMS, or email')}
                        </p>
                    </div>

                    <Tabs defaultValue="compose" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                            <TabsTrigger value="compose">{t('Compose')}</TabsTrigger>
                            <TabsTrigger value="templates">{t('Templates')}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="compose" className="space-y-6">
                            {/* Channel Selection */}
                            <div>
                                <Label className="mb-3 block">{t('Select Channel')}</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {channels.map((channel) => {
                                        const Icon = channel.icon;
                                        const isSelected = formData.channel === channel.value;
                                        return (
                                            <button
                                                key={channel.value}
                                                type="button"
                                                onClick={() =>
                                                    setFormData({ ...formData, channel: channel.value })
                                                }
                                                className={`p-4 border-2 rounded-lg transition-all ${isSelected
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-primary/50'
                                                    }`}
                                            >
                                                <Icon className={`w-6 h-6 mx-auto mb-2 ${channel.color}`} />
                                                <p className="text-sm font-medium text-center">{channel.label}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Recipient Selection */}
                            <RecipientSelector
                                recipientType={formData.recipientType}
                                merchantType={formData.merchantType}
                                specificMerchantIds={formData.specificMerchantIds}
                                onRecipientTypeChange={(type: RecipientType) =>
                                    setFormData({ ...formData, recipientType: type })
                                }
                                onMerchantTypeChange={(type: MerchantType) => setFormData({ ...formData, merchantType: type })}
                                onSpecificMerchantsChange={(ids: string[]) =>
                                    setFormData({ ...formData, specificMerchantIds: ids })
                                }
                            />

                            {/* Message Content */}
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="title">{t('Message Title')} *</Label>
                                    <Input
                                        id="title"
                                        placeholder={t("e.g., New Feature Update")}
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        maxLength={100}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formData.title.length}/100 {t('characters')}
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="body">{t('Message Body')} *</Label>
                                    <Textarea
                                        id="body"
                                        placeholder={t("Write your message here...")}
                                        value={formData.body}
                                        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                        rows={6}
                                        maxLength={500}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formData.body.length}/500 {t('characters')}
                                    </p>
                                </div>

                                {formData.channel === MessageChannel.PUSH && (
                                    <div>
                                        <Label htmlFor="url">
                                            {t('Action URL')} ({t('Optional')})
                                        </Label>
                                        <Input
                                            id="url"
                                            placeholder={t("e.g., /merchant/orders")}
                                            value={formData.url}
                                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {t('URL to open when notification is clicked')}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Recipient Summary */}
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-primary" />
                                        <span className="font-medium">{t('Recipients')}:</span>
                                    </div>
                                    <Badge variant="secondary" className="text-lg px-3 py-1">
                                        {recipientCount} {t('merchants')}
                                    </Badge>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowPreview(true)}
                                    disabled={!formData.title || !formData.body}
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    {t('Preview')}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleSendClick}
                                    disabled={isSending || !formData.title || !formData.body || recipientCount === 0}
                                    className="bg-primary hover:bg-primary/90 flex-1"
                                >
                                    {isSending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {t('Sending...')}
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            {t('Send to {count} Recipients', { count: recipientCount })}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="templates">
                            <TemplateSelector onSelect={handleTemplateSelect} />
                        </TabsContent>
                    </Tabs>
                </div>
            </Card>

            {/* Preview Dialog */}
            {showPreview && (
                <MessagePreview
                    title={formData.title}
                    body={formData.body}
                    channel={formData.channel}
                    onClose={() => setShowPreview(false)}
                />
            )}

            {/* Confirm Send Dialog */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('Confirm Send')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t(
                                'You are about to send this message to {count} merchants via {channel}. This action cannot be undone.',
                                {
                                    count: recipientCount,
                                    channel: formData.channel === MessageChannel.ALL ? t('all channels') : formData.channel,
                                }
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmSend} className="bg-primary">
                            {t('Send Messages')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}