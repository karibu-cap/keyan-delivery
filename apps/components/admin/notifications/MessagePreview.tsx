'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';
import { MessageChannel } from '@/types/messaging';

interface MessagePreviewProps {
    title: string;
    body: string;
    channel: MessageChannel;
    onClose: () => void;
}

export function MessagePreview({ title, body, channel, onClose }: MessagePreviewProps) {
    const t = useT();

    const renderPushPreview = () => (
        <div className="space-y-4">
            <div className="text-center mb-4">
                <Smartphone className="w-16 h-16 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{t('Mobile Push Notification')}</p>
            </div>

            {/* Phone mockup */}
            <div className="max-w-[375px] mx-auto">
                <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-[3rem] p-4 shadow-2xl">
                    {/* Notification */}
                    <div className="bg-white rounded-2xl p-4 shadow-lg">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                                <Bell className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs font-semibold text-gray-500">{t('Admin')}</p>
                                    <p className="text-xs text-gray-400">{t('now')}</p>
                                </div>
                                <p className="text-sm font-semibold text-gray-900 mb-1">{title}</p>
                                <p className="text-sm text-gray-600 line-clamp-3">{body}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSMSPreview = () => (
        <div className="space-y-4">
            <div className="text-center mb-4">
                <MessageSquare className="w-16 h-16 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{t('SMS Message')}</p>
            </div>

            {/* Phone mockup */}
            <div className="max-w-[375px] mx-auto">
                <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-[3rem] p-4 shadow-2xl">
                    <div className="bg-gray-100 rounded-2xl p-4 min-h-[200px]">
                        {/* Message bubble */}
                        <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm max-w-[280px]">
                            <p className="text-sm font-semibold mb-2">{title}</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{body}</p>
                            <p className="text-xs text-gray-400 mt-2 text-right">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderEmailPreview = () => (
        <div className="space-y-4">
            <div className="text-center mb-4">
                <Mail className="w-16 h-16 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{t('Email Message')}</p>
            </div>

            {/* Email mockup */}
            <Card className="max-w-[600px] mx-auto overflow-hidden">
                {/* Email header */}
                <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm opacity-90">{t('Admin Notification')}</p>
                            <p className="text-xs opacity-75">admin@yetu.com</p>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold">{title}</h1>
                </div>

                {/* Email body */}
                <div className="p-6 bg-white">
                    <p className="text-gray-700 whitespace-pre-wrap mb-6">{body}</p>

                    <div className="border-t pt-4 text-xs text-gray-500">
                        <p>{t('This message was sent by the admin team.')}</p>
                    </div>
                </div>

                {/* Email footer */}
                <div className="bg-gray-50 p-4 text-center text-xs text-gray-500">
                    <p>© 2025 {t('Your App')}. {t('All rights reserved.')}</p>
                </div>
            </Card>
        </div>
    );

    const renderAllChannelsPreview = () => (
        <div className="space-y-8">
            <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                    {t('This message will be sent via all channels')}
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div>
                    <Badge className="mb-3">
                        <Bell className="w-3 h-3 mr-1" />
                        {t('Push')}
                    </Badge>
                    <div className="scale-75 origin-top">{renderPushPreview()}</div>
                </div>
                <div>
                    <Badge className="mb-3 bg-green-500">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {t('SMS')}
                    </Badge>
                    <div className="scale-75 origin-top">{renderSMSPreview()}</div>
                </div>
                <div>
                    <Badge className="mb-3 bg-purple-500">
                        <Mail className="w-3 h-3 mr-1" />
                        {t('Email')}
                    </Badge>
                    <div className="scale-75 origin-top">{renderEmailPreview()}</div>
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('Message Preview')}</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {channel === MessageChannel.PUSH && renderPushPreview()}
                    {channel === MessageChannel.SMS && renderSMSPreview()}
                    {channel === MessageChannel.EMAIL && renderEmailPreview()}
                    {channel === MessageChannel.ALL && renderAllChannelsPreview()}
                </div>
            </DialogContent>
        </Dialog>
    );
}