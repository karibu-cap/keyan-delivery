'use client';

import Navbar from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeftIcon, UserIcon, MapPinIcon, CreditCardIcon, BellIcon, ShieldIcon, HelpCircleIcon, StoreIcon, CheckCircleIcon, ClockIcon, Store } from "lucide-react"
import { useState } from "react";
import { Prisma, User } from "@prisma/client";
import { useToast } from '@/hooks/use-toast'
import { useT } from '@/hooks/use-inline-translation'

type IUser = Prisma.UserGetPayload<{
    include: {
        merchantManagers: {
            include: {
                merchant: true,
            },
        },
    },
}>;

export function UserProfile({ user }: { user: IUser }) {
    const t = useT()
    const { toast } = useToast()
    const [currentUser, setCurrentUser] = useState<User>(user);
    const [isEditing, setIsEditing] = useState(false);
    const [notifications, setNotifications] = useState({
        orderUpdates: true,
        promotions: false,
        newsletter: true
    });

    const merchants = user.merchantManagers.map((manager) => manager.merchant);

    const handleSaveProfile = async () => {
        if (!currentUser) return;

        try {
            // Here you would typically make an API call to update the user
            // For now, we'll just exit edit mode
            setIsEditing(false);
            toast({
                title: t("Profile Updated"),
                description: t("Your profile has been successfully updated"),
            })
        } catch (error) {
            console.error('Failed to save profile:', error);
            toast({
                title: t("Error"),
                description: t("Failed to update profile. Please try again."),
                variant: "destructive"
            })
        }
    };

    const handleCancelEdit = () => {
        // Reset user data to original state (you might want to fetch fresh data)
        setCurrentUser(user);
        setIsEditing(false);
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-4 py-6">
                <Link href="/">
                    <Button variant="ghost" className="mb-4 gap-2">
                        <ArrowLeftIcon className="h-4 w-4" />
                        {t("Back to Home")}
                    </Button>
                </Link>

                <h1 className="mb-6 text-3xl font-bold">{t("Profile & Settings")}</h1>

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-6">
                        <TabsTrigger value="profile">{t("Profile")}</TabsTrigger>
                        <TabsTrigger value="merchants">{t("Merchants")}</TabsTrigger>
                        <TabsTrigger value="addresses">{t("Addresses")}</TabsTrigger>
                        <TabsTrigger value="payment">{t("Payment")}</TabsTrigger>
                        <TabsTrigger value="notifications">{t("Notifications")}</TabsTrigger>
                        <TabsTrigger value="security">{t("Security")}</TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>{t("Personal Information")}</CardTitle>
                                    <div className="flex gap-2">
                                        {isEditing ? (
                                            <>
                                                <Button variant="outline" onClick={handleCancelEdit}>
                                                    {t("Cancel")}
                                                </Button>
                                                <Button className="bg-[#0aad0a] hover:bg-[#089808]" onClick={handleSaveProfile}>
                                                    {t("Save Changes")}
                                                </Button>
                                            </>
                                        ) : (
                                            <Button className="bg-[#0aad0a] hover:bg-[#089808]" onClick={() => setIsEditing(true)}>
                                                {t("Edit Profile")}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0aad0a]/10">
                                        <UserIcon className="h-10 w-10 text-[#0aad0a]" />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">{t("Full Name")}</Label>
                                        <Input
                                            id="name"
                                            value={currentUser?.fullName || ''}
                                            onChange={(e) => setCurrentUser({ ...currentUser, fullName: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">{t("Email")}</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={currentUser?.email ?? ''}
                                            onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">{t("Phone Number")}</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={currentUser.phone ?? ''}
                                        onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="merchants">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <StoreIcon className="h-5 w-5" />
                                    {t("My Merchants")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {merchants.length > 0 ? (
                                    <div className="space-y-4">
                                        {merchants.map((merchant) => (
                                            <div key={merchant.id} className="rounded-lg border p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex gap-3">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0aad0a]/10">
                                                            <StoreIcon className="h-6 w-6 text-[#0aad0a]" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="mb-2 flex items-center gap-2">
                                                                <h3 className="font-semibold">{merchant.businessName}</h3>
                                                                <Badge variant={merchant.isVerified ? "default" : "secondary"} className={merchant.isVerified ? "bg-green-100 text-green-800" : ""}>
                                                                    {merchant.isVerified ? (
                                                                        <>
                                                                            <CheckCircleIcon className="mr-1 h-3 w-3" />
                                                                            {t("Verified")}
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <ClockIcon className="mr-1 h-3 w-3" />
                                                                            {t("Pending")}
                                                                        </>
                                                                    )}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mb-2">{merchant.phone}</p>
                                                            <div className="flex flex-wrap gap-1 mb-2">
                                                                <Badge variant="outline">{merchant.merchantType}</Badge>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {t("Manager since")}: {new Date(merchant.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {merchant.isVerified && <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/merchant/${merchant.id}`}>
                                                                <Store className="w-4 h-4 mr-2" />
                                                                {t("Manage")}
                                                            </Link>
                                                        </Button>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <StoreIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                        <p className="mb-2">{t("No merchants found")}</p>
                                        <p className="text-sm">{t("You are not managing any merchants yet")}</p>
                                        <div className="mt-4">
                                            <p className="text-sm">{t("Contact an administrator to get access to manage merchants")}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Addresses Tab */}
                    <TabsContent value="addresses">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>{t("Delivery Addresses")}</CardTitle>
                                    <Button className="bg-[#0aad0a] hover:bg-[#089808]">
                                        <MapPinIcon className="mr-2 h-4 w-4" />
                                        {t("Add Address")}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {currentUser.phone ? (
                                        <div className="flex items-start justify-between rounded-lg border p-4">
                                            <div className="flex gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0aad0a]/10">
                                                    <MapPinIcon className="h-5 w-5 text-[#0aad0a]" />
                                                </div>
                                                <div>
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <p className="font-semibold">{t("Phone")}</p>
                                                        <span className="rounded-full bg-[#0aad0a]/10 px-2 py-0.5 text-xs font-medium text-[#0aad0a]">
                                                            {t("Default")}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{currentUser.phone}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm">
                                                    {t("Edit")}
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-destructive">
                                                    {t("Remove")}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <MapPinIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                            <p>{t("No contact information set")}</p>
                                            <p className="text-sm">{t("Add your phone number to get started")}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Payment Tab */}
                    <TabsContent value="payment">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>{t("Payment Methods")}</CardTitle>
                                    <Button className="bg-[#0aad0a] hover:bg-[#089808]">
                                        <CreditCardIcon className="mr-2 h-4 w-4" />
                                        {t("Add Card")}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="text-center py-8 text-muted-foreground">
                                        <CreditCardIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                        <p>{t("No payment methods added yet")}</p>
                                        <p className="text-sm">{t("Add a payment method to place orders")}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("Notification Preferences")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start gap-3">
                                        <BellIcon className="mt-1 h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{t("Order Updates")}</p>
                                            <p className="text-sm text-muted-foreground">{t("Get notified about your order status and delivery")}</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={notifications.orderUpdates}
                                        onCheckedChange={(checked) => setNotifications({ ...notifications, orderUpdates: checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-start gap-3">
                                        <BellIcon className="mt-1 h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{t("Promotions & Deals")}</p>
                                            <p className="text-sm text-muted-foreground">{t("Receive exclusive offers and discounts")}</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={notifications.promotions}
                                        onCheckedChange={(checked) => setNotifications({ ...notifications, promotions: checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-start gap-3">
                                        <BellIcon className="mt-1 h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{t("Newsletter")}</p>
                                            <p className="text-sm text-muted-foreground">{t("Weekly tips, recipes, and product recommendations")}</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={notifications.newsletter}
                                        onCheckedChange={(checked) => setNotifications({ ...notifications, newsletter: checked })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security">
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("Password & Security")}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-start gap-3">
                                            <ShieldIcon className="mt-1 h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{t("Password")}</p>
                                                <p className="text-sm text-muted-foreground">{t("Last changed 3 months ago")}</p>
                                            </div>
                                        </div>
                                        <Button variant="outline">{t("Change Password")}</Button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-start gap-3">
                                            <ShieldIcon className="mt-1 h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{t("Two-Factor Authentication")}</p>
                                                <p className="text-sm text-muted-foreground">{t("Add an extra layer of security")}</p>
                                            </div>
                                        </div>
                                        <Button variant="outline">{t("Enable")}</Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("Account Actions")}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-start gap-3">
                                            <HelpCircleIcon className="mt-1 h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{t("Help & Support")}</p>
                                                <p className="text-sm text-muted-foreground">{t("Get help with your account")}</p>
                                            </div>
                                        </div>
                                        <Button variant="outline">{t("Contact Support")}</Button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-start gap-3">
                                            <ShieldIcon className="mt-1 h-5 w-5 text-destructive" />
                                            <div>
                                                <p className="font-medium text-destructive">{t("Delete Account")}</p>
                                                <p className="text-sm text-muted-foreground">{t("Permanently delete your account")}</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="bg-transparent text-destructive hover:text-destructive">
                                            {t("Delete")}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
