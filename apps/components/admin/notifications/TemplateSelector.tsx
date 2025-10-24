'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getMessageTemplates } from '@/lib/actions/client/admin/messaging';
import { useT } from '@/hooks/use-inline-translation';
import {
    FileText,
    Bell,
    Mail,
    MessageSquare,
    Sparkles,
    Loader2,
} from 'lucide-react';
import { MessageChannel } from '@/types/messaging';

interface TemplateSelectorProps {
    onSelect: (template: any) => void;
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
    const t = useT();
    const [templates, setTemplates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const data = await getMessageTemplates();
            setTemplates(data);
        } catch (error) {
            console.error('Failed to load templates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getChannelIcon = (channel: MessageChannel) => {
        switch (channel) {
            case MessageChannel.PUSH:
                return Bell;
            case MessageChannel.SMS:
                return MessageSquare;
            case MessageChannel.EMAIL:
                return Mail;
            case MessageChannel.ALL:
                return Sparkles;
            default:
                return Bell;
        }
    };

    const getChannelColor = (channel: MessageChannel) => {
        switch (channel) {
            case MessageChannel.PUSH:
                return 'bg-blue-500';
            case MessageChannel.SMS:
                return 'bg-green-500';
            case MessageChannel.EMAIL:
                return 'bg-purple-500';
            case MessageChannel.ALL:
                return 'bg-orange-500';
            default:
                return 'bg-gray-500';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold mb-2">{t('Message Templates')}</h3>
                <p className="text-sm text-muted-foreground">
                    {t('Choose a pre-made template to quickly compose your message')}
                </p>
            </div>

            {templates.length === 0 ? (
                <Card className="p-12 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">{t('No templates available')}</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => {
                        const ChannelIcon = getChannelIcon(template.channel);
                        const channelColor = getChannelColor(template.channel);

                        return (
                            <Card
                                key={template.id}
                                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => onSelect(template)}
                            >
                                <div className="space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <h4 className="font-semibold mb-1">{template.name}</h4>
                                            <Badge variant="secondary" className="text-xs">
                                                <ChannelIcon className="w-3 h-3 mr-1" />
                                                {t(template.channel)}
                                            </Badge>
                                        </div>
                                        <div className={`w-10 h-10 rounded-lg ${channelColor} flex items-center justify-center flex-shrink-0`}>
                                            <ChannelIcon className="w-5 h-5 text-white" />
                                        </div>
                                    </div>

                                    {/* Preview */}
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">{t('Title')}</p>
                                            <p className="text-sm font-medium line-clamp-1">{template.title}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">{t('Body')}</p>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {template.body}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <Button variant="outline" size="sm" className="w-full">
                                        {t('Use This Template')}
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Template Creation Hint */}
            <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                        <p className="text-sm text-blue-900 font-medium mb-1">{t('Pro Tip')}</p>
                        <p className="text-sm text-blue-800">
                            {t('Templates help you send consistent messages quickly. You can customize them after selection.')}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}