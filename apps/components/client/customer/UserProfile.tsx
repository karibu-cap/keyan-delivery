'use client';

import NotificationPermission from "@/components/notifications/NotificationPermission";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useT } from '@/hooks/use-inline-translation';
import { toast, useToast } from '@/hooks/use-toast';
import { updateUser } from "@/lib/actions/server/user/user";
import { LongLat, Prisma, User } from "@prisma/client";
import { ArrowLeftIcon, Briefcase, CheckCircleIcon, ClockIcon, Edit, Home, MapPin, Store, StoreIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SimpleMapPicker from "../map/SimpleMap";

export enum TABS {
    PROFILE = "profile",
    MERCHANTS = "merchants",
    ADDRESSES = "addresses",
    PAYMENT = "payment",
    NOTIFICATIONS = "notifications",
    SECURITY = "security",
}

type IUser = Prisma.UserGetPayload<{
    include: {
        merchantManagers: {
            include: {
                merchant: true,
            },
        },
    },
}>;



interface AddressesTabProps {
    homeLocation?: LongLat | null;
    workLocation?: LongLat | null;
    selectedZone?: {
        name: string;
        color: string;
        geometry: any;
        landmarks?: Array<{ coordinates: { lat: number; lng: number } }>;
    };
    onUpdateAddress: (type: 'home' | 'work', coordinates: LongLat | null) => Promise<void>;
}

export function UserProfile({ user, initialValue }: { user: IUser, initialValue?: TABS }) {
    const t = useT()
    const router = useRouter();
    const { toast } = useToast()
    const [currentUser, setCurrentUser] = useState<User>(user);
    const [isEditing, setIsEditing] = useState(false);

    const merchants = user.merchantManagers.map((manager) => {
        return manager.merchant;
    });

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

    const handleUpdateAddress = async (
        type: 'home' | 'work',
        coordinates: LongLat | null
    ): Promise<void> => updateUserExec({id: currentUser.id, address: type == 'home'?  {homeLocation: coordinates}: {workLocation: coordinates}});

    const {
            execute: updateUserExec,
            isExecuting: isUpdating,
            input,
        } = useAction(updateUser, {
            onSuccess: () => {
                toast({
                    title: t('User'),
                    description: t('The user has been update successfully.'),
                });
                window.location.reload();
            },
            onError: ({ error }) => {
                if (error.serverError) {
                    toast({
                        title: t('Cannot update the user'),
                        description: error.serverError,
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: t('Error'),
                        description: t('Failed to update the user'),
                        variant: "destructive",
                    });
                }
            },
        })


    return (
        <div className="min-h-screen bg-background">

            <main className="container mx-auto px-4 py-6">
                <Link href="/">
                    <Button variant="ghost" className="mb-4 gap-2">
                        <ArrowLeftIcon className="h-4 w-4" />
                        {t("Back to Home")}
                    </Button>
                </Link>

                <h1 className="mb-6 text-3xl font-bold">{t("Profile & Settings")}</h1>

                <Tabs defaultValue={initialValue || TABS.PROFILE} className="space-y-6 relative">
                    <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-6">
                        <TabsTrigger value={TABS.PROFILE}>{t("Profile")}</TabsTrigger>
                        <TabsTrigger value={TABS.ADDRESSES}>{t("Addresses")}</TabsTrigger>
                        {merchants.length > 0 && <TabsTrigger value={TABS.MERCHANTS}>{t("Merchants")}</TabsTrigger>}
                        {/* <TabsTrigger value={TABS.PAYMENT}>{t("Payment")}</TabsTrigger> */}
                        <TabsTrigger value={TABS.NOTIFICATIONS}>{t("Notifications")}</TabsTrigger>
                        {/* <TabsTrigger value={TABS.SECURITY}>{t("Security")}</TabsTrigger> */}
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
                                                <Button className="bg-primary hover:bg-[#089808]" onClick={handleSaveProfile}>
                                                    {t("Save Changes")}
                                                </Button>
                                            </>
                                        ) : (
                                            <Button className="bg-primary hover:bg-[#089808]" onClick={() => setIsEditing(true)}>
                                                {t("Edit Profile")}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-20 w-20 rounded-full">
                                        <AvatarImage src={user.image || ''} alt={user.name} />
                                        <AvatarFallback className="rounded-lg">{user?.name?.[0]?.toUpperCase() || user?.email[0].toUpperCase() || "A"}</AvatarFallback>
                                    </Avatar>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">{t("Full Name")}</Label>
                                        <Input
                                            id="name"
                                            value={currentUser?.name || ''}
                                            onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
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

                    {/* Addresses Tab */}
                    <TabsContent value="addresses">
                        <AddressesTab homeLocation={currentUser.address?.homeLocation}
                            workLocation={currentUser.address?.workLocation}
                            onUpdateAddress={handleUpdateAddress} />

                    </TabsContent>
                    {merchants.length > 0 &&
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
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                                                <StoreIcon className="h-6 w-6 text-primary" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="mb-2 flex items-center gap-2">
                                                                    <h3 className="font-semibold">{merchant.businessName}</h3>
                                                                    <Badge variant={merchant.isVerified ? "default" : "secondary"} className={merchant.isVerified ? "bg-primary/10 text-primary/80" : ""}>
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
                                                                    {t("Manager since")}: {t.formatDateTime(merchant.createdAt)}
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
                        </TabsContent>}


                    {/* Payment Tab */}
                    {/* <TabsContent value="payment">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>{t("Payment Methods")}</CardTitle>
                                    <Button className="bg-primary hover:bg-[#089808]">
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
                    </TabsContent> */}

                    {/* Notifications Tab */}
                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("Notification Preferences")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <NotificationPermission />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    {/* <TabsContent value="security">
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
                    </TabsContent> */}
                </Tabs>
            </main>
        </div>
    )
}


function AddressesTab({
    homeLocation,
    workLocation,
    selectedZone,
    onUpdateAddress
}: AddressesTabProps) {
    const t = useT()

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [addressType, setAddressType] = useState<'home' | 'work'>('home');
    const [selectedCoordinates, setSelectedCoordinates] = useState<LongLat | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const openAddDialog = (type: 'home' | 'work') => {
        setAddressType(type);
        const existingLocation = type === 'home' ? homeLocation : workLocation;
        setSelectedCoordinates(existingLocation || null);
        setIsDialogOpen(true);
    };

    const handleSaveAddress = async () => {
        if (!selectedCoordinates) {
            toast({
                title: t("Please select a location on the map"),
                variant: "destructive",
            });
            return;
        }

        setIsSaving(true);
        try {
            await onUpdateAddress(addressType, selectedCoordinates);

                setIsDialogOpen(false);
        } catch (error) {
            console.error('Error saving address:', error);
            toast({ title: t('An error occurred while saving the address'), variant: "destructive", });
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <>
            <Card>
                <CardContent className="space-y-6 pt-6">
                    {/* Home Address Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Home className="h-5 w-5 text-primary" />
                                <CardTitle>{t("Home Address")}</CardTitle>
                            </div>
                            <Button
                                onClick={() => openAddDialog('home')}
                                className="bg-primary hover:bg-[#089808]"
                            >
                                <MapPin className="mr-2 h-4 w-4" />
                                {homeLocation ? t("Edit Address") : t("Add Address")}
                            </Button>
                        </div>

                        {homeLocation ? (
                            <Card className="p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPin className="h-4 w-4 text-primary" />
                                            <h4 className="font-semibold">{t("Home Location")}</h4>
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <p>{t("Latitude")}: {homeLocation.lat.toFixed(6)}</p>
                                            <p>{t("Longitude")}: {homeLocation.lng.toFixed(6)}</p>
                                            {selectedZone && (
                                                <p className="flex items-center gap-1 text-xs mt-2">
                                                    <MapPin className="h-3 w-3" />
                                                    {selectedZone.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openAddDialog('home')}
                                            className="h-8 w-8"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                <Home className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>{t("No home address set")}</p>
                                <p className="text-xs mt-1">{t("Click 'Add Address' to set your home location")}</p>
                            </div>
                        )}
                    </div>

                    {/* Work Address Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-[#986808]" />
                                <CardTitle>{t("Work Address")}</CardTitle>
                            </div>
                            <Button
                                onClick={() => openAddDialog('work')}
                                className="bg-[#986808] hover:bg-[#7a5306]"
                            >
                                <MapPin className="mr-2 h-4 w-4" />
                                {workLocation ? t("Edit Address") : t("Add Address")}
                            </Button>
                        </div>

                        {workLocation ? (
                            <Card className="p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPin className="h-4 w-4 text-[#986808]" />
                                            <h4 className="font-semibold">{t("Work Location")}</h4>
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <p>{t("Latitude")}: {workLocation.lat.toFixed(6)}</p>
                                            <p>{t("Longitude")}: {workLocation.lng.toFixed(6)}</p>
                                            {selectedZone && (
                                                <p className="flex items-center gap-1 text-xs mt-2">
                                                    <MapPin className="h-3 w-3" />
                                                    {selectedZone.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openAddDialog('work')}
                                            className="h-8 w-8"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>{t("No work address set")}</p>
                                <p className="text-xs mt-1">{t("Click 'Add Address' to set your work location")}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Address Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {addressType === 'home' ? (
                                <div className="flex items-center gap-2">
                                    <Home className="h-5 w-5 text-primary" />
                                    {homeLocation ? t("Edit Home Address") : t("Add Home Address")}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-[#986808]" />
                                    {workLocation ? t("Edit Work Address") : t("Add Work Address")}
                                </div>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {t("Pin your exact location on the map by tapping or dragging the marker")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Map Picker */}
                        <div className="overflow-hidden" style={{ height: '500px' }}>
                            <SimpleMapPicker
                                initialCenter={
                                    selectedCoordinates ||
                                    (selectedZone?.landmarks && selectedZone?.landmarks.length > 0
                                        ? {
                                            lat: selectedZone?.landmarks[0].coordinates.lat,
                                            lng: selectedZone?.landmarks[0].coordinates.lng,
                                        }
                                        : undefined)
                                }
                                onLocationSelect={(coords) => {
                                    setSelectedCoordinates(coords);
                                }}
                                selectedCoordinates={selectedCoordinates || undefined}
                            />
                        </div>

                        {selectedCoordinates && (
                            <div className="bg-muted p-3 rounded-lg text-sm">
                                <p className="font-medium mb-1">{t("Selected Location")}:</p>
                                <p className="text-muted-foreground">
                                    {t("Lat")}: {selectedCoordinates.lat.toFixed(6)}, {t("Lng")}: {selectedCoordinates.lng.toFixed(6)}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-2 justify-end pt-4 border-t">
                            <Button
                                onClick={handleSaveAddress}
                                disabled={isSaving || !selectedCoordinates}
                                className={addressType === 'home' ? 'bg-primary hover:bg-[#089808]' : 'bg-[#986808] hover:bg-[#7a5306]'}
                            >
                                {isSaving ? t("Saving...") : t("Save Location")}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}