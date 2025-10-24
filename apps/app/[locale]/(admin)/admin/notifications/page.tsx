import { MessageComposer } from '@/components/admin/notifications/MessageComposer';
import { getMerchantStats } from '@/lib/actions/server/admin/messaging';
import { getServerT } from '@/i18n/server-translations';
import { Card } from '@/components/ui/card';
import {
    Bell,
    Mail,
    MessageSquare,
    Users,
    CheckCircle,
    AlertCircle,
    Store,
} from 'lucide-react';

export const metadata = {
    title: 'Merchant Notifications | Admin Panel',
    description: 'Send push notifications, SMS, and emails to merchants',
};

export default async function AdminNotificationsPage() {
    const t = await getServerT();
    const merchantStats = await getMerchantStats();

    const stats = [
        {
            label: t('Total Merchants'),
            value: merchantStats.total.toString(),
            icon: Store,
            color: 'bg-blue-500',
            description: t('All registered merchants'),
        },
        {
            label: t('Verified Merchants'),
            value: merchantStats.verified.toString(),
            icon: CheckCircle,
            color: 'bg-green-500',
            description: t('Can receive orders'),
        },
        {
            label: t('Pending Verification'),
            value: merchantStats.unverified.toString(),
            icon: AlertCircle,
            color: 'bg-yellow-500',
            description: t('Awaiting verification'),
        },
        {
            label: t('Food Merchants'),
            value: (merchantStats.byType.FOOD || 0).toString(),
            icon: Users,
            color: 'bg-purple-500',
            description: t('Restaurant category'),
        },
    ];

    const channels = [
        {
            name: t('Push Notifications'),
            icon: Bell,
            description: t('Instant notifications on merchant devices'),
            color: 'text-blue-500',
            features: [t('Instant delivery'), t('Rich content'), t('Action buttons')],
        },
        {
            name: t('SMS Messages'),
            icon: MessageSquare,
            description: t('Direct text messages to merchant phones'),
            color: 'text-green-500',
            features: [t('High open rate'), t('No app required'), t('Urgent messages')],
        },
        {
            name: t('Email'),
            icon: Mail,
            description: t('Professional email communications'),
            color: 'text-purple-500',
            features: [t('Detailed content'), t('Attachments'), t('Professional')],
        },
    ];

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{t('Merchant Notifications')}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t('Send push notifications, SMS, and emails to merchants')}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                        <Card key={index} className="p-6">
                            <div className="flex items-start gap-4">
                                <div
                                    className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}
                                >
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <p className="text-sm font-medium text-foreground truncate">{stat.label}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Channel Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {channels.map((channel, index) => (
                        <Card key={index} className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <channel.icon className={`w-8 h-8 ${channel.color}`} />
                                <h3 className="text-lg font-semibold">{channel.name}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">{channel.description}</p>
                            <div className="space-y-2">
                                {channel.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Message Composer */}
                <MessageComposer merchantStats={merchantStats} />

                {/* Usage Tips */}
                <Card className="p-6 bg-blue-50 border-blue-200">
                    <div className="flex items-start gap-3">
                        <Bell className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-2">{t('Best Practices')}</h3>
                            <ul className="space-y-1 text-sm text-blue-800">
                                <li>• {t('Use push notifications for time-sensitive updates')}</li>
                                <li>• {t('Send SMS for urgent matters requiring immediate attention')}</li>
                                <li>• {t('Use email for detailed information and documentation')}</li>
                                <li>• {t('Test your message before sending to all merchants')}</li>
                                <li>
                                    • {t('Keep messages clear, concise, and action-oriented')}
                                </li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
}