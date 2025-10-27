// apps/components/admin/settings/SettingsClient.tsx
// Client component for platform settings

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/hooks/use-inline-translation";
import { useRouter } from "next/navigation";
import {
    updateGeneralSettings,
    updateOrderSettings,
    updateDeliverySettings,
    updateNotificationSettings,
    updatePaymentSettings,
    clearPlatformCache,
} from "@/lib/actions/server/admin/settings";
import {
    Settings,
    ShoppingCart,
    Truck,
    Bell,
    CreditCard,
    Globe,
    Loader2,
    RefreshCw,
} from "lucide-react";

interface SettingsClientProps {
    settings: {
        general: {
            platformName: string;
            platformEmail: string;
            platformPhone: string;
            currency: string;
            timezone: string;
        };
        orders: {
            autoAcceptOrders: boolean;
            orderTimeout: number;
            cancellationWindow: number;
            minOrderAmount: number;
        };
        delivery: {
            defaultDeliveryFee: number;
            freeDeliveryThreshold: number;
            maxDeliveryDistance: number;
            deliveryTimeSlots: boolean;
        };
        notifications: {
            emailNotifications: boolean;
            smsNotifications: boolean;
            pushNotifications: boolean;
            orderNotifications: boolean;
            promotionNotifications: boolean;
        };
        payments: {
            cashOnDelivery: boolean;
            mobilePayment: boolean;
            cardPayment: boolean;
            commission: number;
        };
    };
}

export default function SettingsClient({ settings }: SettingsClientProps) {
    const t = useT();
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
    const [isClearingCache, setIsClearingCache] = useState(false);

    const [generalSettings, setGeneralSettings] = useState(settings.general);
    const [orderSettings, setOrderSettings] = useState(settings.orders);
    const [deliverySettings, setDeliverySettings] = useState(settings.delivery);
    const [notificationSettings, setNotificationSettings] = useState(settings.notifications);
    const [paymentSettings, setPaymentSettings] = useState(settings.payments);

    const handleSaveGeneral = async () => {
        setIsSubmitting("general");
        try {
            await updateGeneralSettings(generalSettings);
            toast({
                title: t("Settings saved"),
                description: t("General settings have been updated successfully"),
            });
            router.refresh();
        } catch (error: any) {
            toast({
                title: t("Error"),
                description: error.message || t("Failed to update settings"),
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(null);
        }
    };

    const handleSaveOrders = async () => {
        setIsSubmitting("orders");
        try {
            await updateOrderSettings(orderSettings);
            toast({
                title: t("Settings saved"),
                description: t("Order settings have been updated successfully"),
            });
            router.refresh();
        } catch (error: any) {
            toast({
                title: t("Error"),
                description: error.message || t("Failed to update settings"),
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(null);
        }
    };

    const handleSaveDelivery = async () => {
        setIsSubmitting("delivery");
        try {
            await updateDeliverySettings(deliverySettings);
            toast({
                title: t("Settings saved"),
                description: t("Delivery settings have been updated successfully"),
            });
            router.refresh();
        } catch (error: any) {
            toast({
                title: t("Error"),
                description: error.message || t("Failed to update settings"),
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(null);
        }
    };

    const handleSaveNotifications = async () => {
        setIsSubmitting("notifications");
        try {
            await updateNotificationSettings(notificationSettings);
            toast({
                title: t("Settings saved"),
                description: t("Notification settings have been updated successfully"),
            });
            router.refresh();
        } catch (error: any) {
            toast({
                title: t("Error"),
                description: error.message || t("Failed to update settings"),
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(null);
        }
    };

    const handleSavePayments = async () => {
        setIsSubmitting("payments");
        try {
            await updatePaymentSettings(paymentSettings);
            toast({
                title: t("Settings saved"),
                description: t("Payment settings have been updated successfully"),
            });
            router.refresh();
        } catch (error: any) {
            toast({
                title: t("Error"),
                description: error.message || t("Failed to update settings"),
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(null);
        }
    };

    const handleClearCache = async () => {
        setIsClearingCache(true);
        try {
            await clearPlatformCache();
            toast({
                title: t("Cache cleared"),
                description: t("Platform cache has been cleared successfully"),
            });
        } catch (error: any) {
            toast({
                title: t("Error"),
                description: error.message || t("Failed to clear cache"),
                variant: "destructive",
            });
        } finally {
            setIsClearingCache(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* General Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        {t("General Settings")}
                    </CardTitle>
                    <CardDescription>
                        {t("Basic platform information and configuration")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor="platformName">{t("Platform Name")}</Label>
                            <Input
                                id="platformName"
                                value={generalSettings.platformName}
                                onChange={(e) =>
                                    setGeneralSettings({ ...generalSettings, platformName: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="platformEmail">{t("Platform Email")}</Label>
                            <Input
                                id="platformEmail"
                                type="email"
                                value={generalSettings.platformEmail}
                                onChange={(e) =>
                                    setGeneralSettings({
                                        ...generalSettings,
                                        platformEmail: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="platformPhone">{t("Platform Phone")}</Label>
                            <Input
                                id="platformPhone"
                                value={generalSettings.platformPhone}
                                onChange={(e) =>
                                    setGeneralSettings({
                                        ...generalSettings,
                                        platformPhone: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="currency">{t("Currency")}</Label>
                            <Select
                                value={generalSettings.currency}
                                onValueChange={(value) =>
                                    setGeneralSettings({ ...generalSettings, currency: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="XAF">XAF - Central African Franc</SelectItem>
                                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSaveGeneral}
                            disabled={isSubmitting === "general"}
                        >
                            {isSubmitting === "general" ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t("Saving...")}
                                </>
                            ) : (
                                t("Save Changes")
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Order Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        {t("Order Settings")}
                    </CardTitle>
                    <CardDescription>{t("Configure order processing and policies")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>{t("Auto Accept Orders")}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t("Automatically accept all incoming orders")}
                            </p>
                        </div>
                        <Switch
                            checked={orderSettings.autoAcceptOrders}
                            onCheckedChange={(checked) =>
                                setOrderSettings({ ...orderSettings, autoAcceptOrders: checked })
                            }
                        />
                    </div>
                    <Separator />
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor="orderTimeout">{t("Order Timeout (minutes)")}</Label>
                            <Input
                                id="orderTimeout"
                                type="number"
                                min="5"
                                value={orderSettings.orderTimeout}
                                onChange={(e) =>
                                    setOrderSettings({
                                        ...orderSettings,
                                        orderTimeout: parseInt(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="cancellationWindow">
                                {t("Cancellation Window (minutes)")}
                            </Label>
                            <Input
                                id="cancellationWindow"
                                type="number"
                                min="0"
                                value={orderSettings.cancellationWindow}
                                onChange={(e) =>
                                    setOrderSettings({
                                        ...orderSettings,
                                        cancellationWindow: parseInt(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="minOrderAmount">{t("Minimum Order Amount")}</Label>
                            <Input
                                id="minOrderAmount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={orderSettings.minOrderAmount}
                                onChange={(e) =>
                                    setOrderSettings({
                                        ...orderSettings,
                                        minOrderAmount: parseFloat(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <Separator />
                    <div className="flex justify-end">
                        <Button onClick={handleSaveOrders} disabled={isSubmitting === "orders"}>
                            {isSubmitting === "orders" ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t("Saving...")}
                                </>
                            ) : (
                                t("Save Changes")
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Delivery Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        {t("Delivery Settings")}
                    </CardTitle>
                    <CardDescription>{t("Configure delivery options and fees")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor="defaultDeliveryFee">{t("Default Delivery Fee")}</Label>
                            <Input
                                id="defaultDeliveryFee"
                                type="number"
                                min="0"
                                step="0.01"
                                value={deliverySettings.defaultDeliveryFee}
                                onChange={(e) =>
                                    setDeliverySettings({
                                        ...deliverySettings,
                                        defaultDeliveryFee: parseFloat(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="freeDeliveryThreshold">
                                {t("Free Delivery Threshold")}
                            </Label>
                            <Input
                                id="freeDeliveryThreshold"
                                type="number"
                                min="0"
                                step="0.01"
                                value={deliverySettings.freeDeliveryThreshold}
                                onChange={(e) =>
                                    setDeliverySettings({
                                        ...deliverySettings,
                                        freeDeliveryThreshold: parseFloat(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="maxDeliveryDistance">
                                {t("Max Delivery Distance (km)")}
                            </Label>
                            <Input
                                id="maxDeliveryDistance"
                                type="number"
                                min="1"
                                value={deliverySettings.maxDeliveryDistance}
                                onChange={(e) =>
                                    setDeliverySettings({
                                        ...deliverySettings,
                                        maxDeliveryDistance: parseInt(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>{t("Delivery Time Slots")}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t("Allow customers to select delivery time slots")}
                            </p>
                        </div>
                        <Switch
                            checked={deliverySettings.deliveryTimeSlots}
                            onCheckedChange={(checked) =>
                                setDeliverySettings({ ...deliverySettings, deliveryTimeSlots: checked })
                            }
                        />
                    </div>
                    <Separator />
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSaveDelivery}
                            disabled={isSubmitting === "delivery"}
                        >
                            {isSubmitting === "delivery" ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t("Saving...")}
                                </>
                            ) : (
                                t("Save Changes")
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        {t("Notification Settings")}
                    </CardTitle>
                    <CardDescription>
                        {t("Configure notification channels and preferences")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>{t("Email Notifications")}</Label>
                                <p className="text-sm text-muted-foreground">
                                    {t("Send notifications via email")}
                                </p>
                            </div>
                            <Switch
                                checked={notificationSettings.emailNotifications}
                                onCheckedChange={(checked) =>
                                    setNotificationSettings({
                                        ...notificationSettings,
                                        emailNotifications: checked,
                                    })
                                }
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>{t("SMS Notifications")}</Label>
                                <p className="text-sm text-muted-foreground">
                                    {t("Send notifications via SMS")}
                                </p>
                            </div>
                            <Switch
                                checked={notificationSettings.smsNotifications}
                                onCheckedChange={(checked) =>
                                    setNotificationSettings({
                                        ...notificationSettings,
                                        smsNotifications: checked,
                                    })
                                }
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>{t("Push Notifications")}</Label>
                                <p className="text-sm text-muted-foreground">
                                    {t("Send push notifications to mobile apps")}
                                </p>
                            </div>
                            <Switch
                                checked={notificationSettings.pushNotifications}
                                onCheckedChange={(checked) =>
                                    setNotificationSettings({
                                        ...notificationSettings,
                                        pushNotifications: checked,
                                    })
                                }
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>{t("Order Notifications")}</Label>
                                <p className="text-sm text-muted-foreground">
                                    {t("Notify users about order updates")}
                                </p>
                            </div>
                            <Switch
                                checked={notificationSettings.orderNotifications}
                                onCheckedChange={(checked) =>
                                    setNotificationSettings({
                                        ...notificationSettings,
                                        orderNotifications: checked,
                                    })
                                }
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>{t("Promotion Notifications")}</Label>
                                <p className="text-sm text-muted-foreground">
                                    {t("Notify users about promotions and deals")}
                                </p>
                            </div>
                            <Switch
                                checked={notificationSettings.promotionNotifications}
                                onCheckedChange={(checked) =>
                                    setNotificationSettings({
                                        ...notificationSettings,
                                        promotionNotifications: checked,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <Separator />
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSaveNotifications}
                            disabled={isSubmitting === "notifications"}
                        >
                            {isSubmitting === "notifications" ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t("Saving...")}
                                </>
                            ) : (
                                t("Save Changes")
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        {t("Payment Settings")}
                    </CardTitle>
                    <CardDescription>{t("Configure payment methods and commission")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>{t("Cash on Delivery")}</Label>
                                <p className="text-sm text-muted-foreground">
                                    {t("Allow customers to pay with cash")}
                                </p>
                            </div>
                            <Switch
                                checked={paymentSettings.cashOnDelivery}
                                onCheckedChange={(checked) =>
                                    setPaymentSettings({ ...paymentSettings, cashOnDelivery: checked })
                                }
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>{t("Mobile Payment")}</Label>
                                <p className="text-sm text-muted-foreground">
                                    {t("Allow customers to pay via mobile money")}
                                </p>
                            </div>
                            <Switch
                                checked={paymentSettings.mobilePayment}
                                onCheckedChange={(checked) =>
                                    setPaymentSettings({ ...paymentSettings, mobilePayment: checked })
                                }
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>{t("Card Payment")}</Label>
                                <p className="text-sm text-muted-foreground">
                                    {t("Allow customers to pay with credit/debit cards")}
                                </p>
                            </div>
                            <Switch
                                checked={paymentSettings.cardPayment}
                                onCheckedChange={(checked) =>
                                    setPaymentSettings({ ...paymentSettings, cardPayment: checked })
                                }
                            />
                        </div>
                    </div>
                    <Separator />
                    <div>
                        <Label htmlFor="commission">{t("Platform Commission (%)")}</Label>
                        <Input
                            id="commission"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={paymentSettings.commission}
                            onChange={(e) =>
                                setPaymentSettings({
                                    ...paymentSettings,
                                    commission: parseFloat(e.target.value) || 0,
                                })
                            }
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                            {t("Commission charged on each order")}
                        </p>
                    </div>
                    <Separator />
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSavePayments}
                            disabled={isSubmitting === "payments"}
                        >
                            {isSubmitting === "payments" ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t("Saving...")}
                                </>
                            ) : (
                                t("Save Changes")
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* System Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        {t("System Actions")}
                    </CardTitle>
                    <CardDescription>{t("Maintenance and system operations")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>{t("Clear Platform Cache")}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t("Clear all cached data to apply changes immediately")}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleClearCache}
                            disabled={isClearingCache}
                        >
                            {isClearingCache ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t("Clearing...")}
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    {t("Clear Cache")}
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}