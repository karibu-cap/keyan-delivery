"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Upload, Camera, MapPin, Loader2 } from "lucide-react";
import { Media, MerchantType } from "@prisma/client";
import Link from "next/link";
import { uploadImages } from "@/lib/actions/client";
import { ROUTES } from "@/lib/router";
import { createNewMerchant } from "@/lib/actions/merchants";
import { useToast } from "@/hooks/use-toast";

export default function NewMerchantPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>("");
    const [bannerPreview, setBannerPreview] = useState<string>("");
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        businessName: "",
        phone: "",
        merchantType: "" as MerchantType,
        address: "",
        latitude: 0,
        longitude: 0,
        categories: [] as string[],
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBannerFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setBannerPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData((prev) => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    }));
                    toast({
                        title: 'Location captured successfully',
                        description: 'Please try again later',
                        variant: 'default',
                    })
                },
                (error) => {
                    toast({
                        title: 'Failed to get location',
                        description: 'Please enter manually',
                        variant: 'destructive',
                    })
                }
            );
        } else {
            toast({
                title: 'Geolocation not supported',
                description: 'Please enter manually',
                variant: 'destructive',
            })
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.businessName || !formData.phone || !formData.merchantType) {
            toast({
                title: 'Please fill in all required fields',
                description: 'Please try again later',
                variant: 'destructive',
            })
            return;
        }
        if (!logoFile) {
            toast({
                title: 'Please upload a business logo',
                description: 'Please try again later',
                variant: 'destructive',
            })
            return;
        }

        if (!formData.latitude || !formData.longitude) {
            toast({
                title: 'Please capture your business location',
                description: 'Please try again later',
                variant: 'destructive',
            })
            return;
        }

        setIsSubmitting(true);

        // Upload logo
        let result: Media[] | null
        if (bannerFile) {
            result = await uploadImages([logoFile, bannerFile]);
        } else {
            result = await uploadImages([logoFile]);
        }


        if (!result) {
            setIsSubmitting(false);
            toast({
                title: 'Failed to upload logo',
                description: 'Please try again later',
                variant: 'destructive',
            })
            return;
        }

        const logoUrl = result[0].url;
        const bannerUrl = result[1]?.url;

        // Create merchant application
        const success = await createNewMerchant({
            businessName: formData.businessName,
            phone: formData.phone,
            merchantType: formData.merchantType,
            address: formData.address,
            latitude: formData.latitude,
            longitude: formData.longitude,
            logoUrl,
            bannerUrl,
            categories: formData.categories,
        });

        if (!success) {
            toast({
                title: 'Failed to submit application',
                description: 'Please try again later',
                variant: 'destructive',
            })
            return;
        }

        toast({
            title: 'Application submitted successfully!',
            description: 'Your merchant application is pending approval.',
            variant: 'default',
        })
        setIsSubmitting(false);
        router.push(ROUTES.profile);


    };
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container mx-auto max-w-4xl px-4 py-8">
                <Link
                    href="/profile"
                    className="inline-flex items-center text-foreground mb-6 hover:text-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Profile
                </Link>

                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Become a Merchant</h1>
                    <p className="text-muted-foreground">
                        Join our platform and start selling your products
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Business Information */}
                    <Card className="p-6 rounded-2xl shadow-card">
                        <h2 className="text-xl font-semibold mb-4">Business Information</h2>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="businessName">
                                    Business Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="businessName"
                                    placeholder="Enter your business name"
                                    value={formData.businessName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, businessName: e.target.value })
                                    }
                                    required
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label htmlFor="phone">
                                    Phone Number <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+1 234 567 8900"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phone: e.target.value })
                                    }
                                    required
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label htmlFor="merchantType">
                                    Business Type <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={formData.merchantType}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            merchantType: value as MerchantType,
                                        })
                                    }
                                >
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Select business type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={MerchantType.GROCERY}>
                                            Grocery Store
                                        </SelectItem>
                                        <SelectItem value={MerchantType.FOOD}>
                                            Restaurant / Food
                                        </SelectItem>
                                        <SelectItem value={MerchantType.PHARMACY}>
                                            Pharmacy
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </Card>

                    {/* Business Images */}
                    <Card className="p-6 rounded-2xl shadow-card">
                        <h2 className="text-xl font-semibold mb-4">Business Images</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Logo Upload */}
                            <div>
                                <Label htmlFor="logo">
                                    Business Logo <span className="text-destructive">*</span>
                                </Label>
                                <div className="mt-2">
                                    {logoPreview ? (
                                        <div className="relative w-full h-48 rounded-lg border-2 border-dashed border-border overflow-hidden">
                                            <img
                                                src={logoPreview}
                                                alt="Logo preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                className="absolute bottom-2 right-2"
                                                onClick={() => {
                                                    setLogoFile(null);
                                                    setLogoPreview("");
                                                }}
                                            >
                                                Change
                                            </Button>
                                        </div>
                                    ) : (
                                        <label
                                            htmlFor="logo"
                                            className="flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer"
                                        >
                                            <Camera className="w-12 h-12 text-muted-foreground mb-2" />
                                            <span className="text-sm text-muted-foreground">
                                                Click to upload logo
                                            </span>
                                            <input
                                                id="logo"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Banner Upload */}
                            <div>
                                <Label htmlFor="banner">Business Banner (Optional)</Label>
                                <div className="mt-2">
                                    {bannerPreview ? (
                                        <div className="relative w-full h-48 rounded-lg border-2 border-dashed border-border overflow-hidden">
                                            <img
                                                src={bannerPreview}
                                                alt="Banner preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                className="absolute bottom-2 right-2"
                                                onClick={() => {
                                                    setBannerFile(null);
                                                    setBannerPreview("");
                                                }}
                                            >
                                                Change
                                            </Button>
                                        </div>
                                    ) : (
                                        <label
                                            htmlFor="banner"
                                            className="flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer"
                                        >
                                            <Upload className="w-12 h-12 text-muted-foreground mb-2" />
                                            <span className="text-sm text-muted-foreground">
                                                Click to upload banner
                                            </span>
                                            <input
                                                id="banner"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleBannerChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Business Location */}
                    <Card className="p-6 rounded-2xl shadow-card">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-semibold">Business Location</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    We need your exact location to show your business to nearby
                                    customers
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={getCurrentLocation}
                            >
                                <MapPin className="w-4 h-4 mr-2" />
                                Use Current Location
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="address">
                                    Business Address <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="address"
                                    placeholder="Enter your complete business address"
                                    value={formData.address}
                                    onChange={(e) =>
                                        setFormData({ ...formData, address: e.target.value })
                                    }
                                    required
                                    className="mt-2"
                                    rows={3}
                                />
                            </div>

                            {formData.latitude !== 0 && formData.longitude !== 0 && (
                                <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                                    <p className="text-sm text-success-foreground">
                                        ✓ Location captured: {formData.latitude.toFixed(6)},{" "}
                                        {formData.longitude.toFixed(6)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => router.back()}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-[#0aad0a] hover:bg-[#089808]"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Application"
                            )}
                        </Button>
                    </div>
                </form>

                {/* Information Box */}
                <Card className="p-6 rounded-2xl shadow-card mt-6 bg-accent">
                    <h3 className="font-semibold mb-2">What happens next?</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Your application will be reviewed by our team</li>
                        <li>• You'll receive a confirmation email within 24-48 hours</li>
                        <li>
                            • Once approved, you'll need to add at least 5 products before
                            your store goes live
                        </li>
                        <li>• You'll be able to manage your products and orders from the merchant dashboard</li>
                    </ul>
                </Card>
            </div>
        </div>
    );
}