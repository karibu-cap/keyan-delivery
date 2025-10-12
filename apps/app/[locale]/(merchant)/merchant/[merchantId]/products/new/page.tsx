"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { ArrowLeft, Upload, X, Loader2, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { uploadImages } from "@/lib/actions/client";
import { createMerchantProduct } from "@/lib/actions/merchants";
import { ProductStatus, ProductBadge } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchCategories } from "@/lib/actions/stores";
import { ROUTES } from "@/lib/router";

interface Category {
    id: string;
    name: string;
}

export default function NewProductPage() {
    const params = useParams<{ merchantId: string }>();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        compareAtPrice: "",
        stock: "",
        unit: "unit",
        categoryIds: [] as string[],
        weight: "",
        weightUnit: "lb",
        badges: [] as ProductBadge[],
    });

    useEffect(() => {
        _fetchCategories();
    }, []);

    const _fetchCategories = async () => {
        try {
            const res = await fetchCategories({ limit: 100, offset: 0 });
            if (res?.categories.length > 0) {
                setCategories(res.categories.filter((c: Category) => c.id !== 'all'));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (imageFiles.length + files.length > 5) {
            toast({
                title: 'Too many images',
                description: 'You can upload a maximum of 5 images',
                variant: 'destructive'
            });
            return;
        }

        setImageFiles([...imageFiles, ...files]);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleBadgeToggle = (badge: ProductBadge) => {
        setFormData(prev => ({
            ...prev,
            badges: prev.badges.includes(badge)
                ? prev.badges.filter(b => b !== badge)
                : [...prev.badges, badge]
        }));
    };

    const handleSubmit = async (status: ProductStatus) => {
        // Validation
        if (!formData.title || !formData.description || !formData.price || !formData.stock) {
            toast({
                title: 'Missing fields',
                description: 'Please fill in all required fields',
                variant: 'destructive'
            });
            return;
        }

        if (imageFiles.length === 0) {
            toast({
                title: 'Missing image',
                description: 'Please upload at least one product image',
                variant: 'destructive'
            });
            return;
        }

        if (formData.categoryIds.length === 0) {
            toast({
                title: 'Missing category',
                description: 'Please select at least one category',
                variant: 'destructive'
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Upload images
            const uploadedMedia = await uploadImages(imageFiles);

            if (!uploadedMedia || uploadedMedia.length === 0) {
                throw new Error("Failed to upload images");
            }

            // Create product
            const res = await createMerchantProduct({
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
                stock: parseInt(formData.stock),
                unit: formData.unit,
                categoryIds: formData.categoryIds,
                status,
                weight: formData.weight ? parseFloat(formData.weight) : null,
                weightUnit: formData.weightUnit,
                badges: formData.badges,
                images: uploadedMedia
            }, params.merchantId)

            if (res.success) {
                toast({
                    title: 'Success!',
                    description: res.message,
                    variant: 'default'
                });
                router.push(`/merchant/${params.merchantId}/products`);
            } else {
                toast({
                    title: 'Error',
                    description: res.error,
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error('Error creating product:', error);
            toast({
                title: 'Error',
                description: 'Failed to create product',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const badges = Object.values(ProductBadge);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container mx-auto max-w-4xl px-4 py-8">
                <Link
                    href={`/merchant/${params.merchantId}/products`}
                    className="inline-flex items-center text-foreground mb-6 hover:text-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Products
                </Link>

                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Add New Product</h1>
                    <p className="text-muted-foreground">
                        Create a new product for your store
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <Card className="p-6 rounded-2xl shadow-card">
                        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="title">
                                    Product Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Fresh Organic Apples"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">
                                    Description <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe your product..."
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    className="mt-2"
                                    rows={4}
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="categories">
                                        Categories <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={formData.categoryIds[0] || ""}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, categoryIds: [value] })
                                        }
                                    >
                                        <SelectTrigger className="mt-2">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="unit">Unit</Label>
                                    <Select
                                        value={formData.unit}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, unit: value })
                                        }
                                    >
                                        <SelectTrigger className="mt-2">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unit">Per Unit</SelectItem>
                                            <SelectItem value="kg">Per Kilogram</SelectItem>
                                            <SelectItem value="lb">Per Pound</SelectItem>
                                            <SelectItem value="g">Per Gram</SelectItem>
                                            <SelectItem value="liter">Per Liter</SelectItem>
                                            <SelectItem value="ml">Per Milliliter</SelectItem>
                                            <SelectItem value="dozen">Per Dozen</SelectItem>
                                            <SelectItem value="pack">Per Pack</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Pricing & Inventory */}
                    <Card className="p-6 rounded-2xl shadow-card">
                        <h2 className="text-xl font-semibold mb-4">Pricing & Inventory</h2>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="price">
                                    Price <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={(e) =>
                                        setFormData({ ...formData, price: e.target.value })
                                    }
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label htmlFor="compareAtPrice">Compare at Price (Optional)</Label>
                                <Input
                                    id="compareAtPrice"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.compareAtPrice}
                                    onChange={(e) =>
                                        setFormData({ ...formData, compareAtPrice: e.target.value })
                                    }
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label htmlFor="stock">
                                    Stock Quantity <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    placeholder="0"
                                    value={formData.stock}
                                    onChange={(e) =>
                                        setFormData({ ...formData, stock: e.target.value })
                                    }
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <Label htmlFor="weight">Weight (Optional)</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.0"
                                    value={formData.weight}
                                    onChange={(e) =>
                                        setFormData({ ...formData, weight: e.target.value })
                                    }
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label htmlFor="weightUnit">Weight Unit</Label>
                                <Select
                                    value={formData.weightUnit}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, weightUnit: value })
                                    }
                                >
                                    <SelectTrigger className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lb">Pounds (lb)</SelectItem>
                                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                        <SelectItem value="g">Grams (g)</SelectItem>
                                        <SelectItem value="oz">Ounces (oz)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </Card>

                    {/* Product Images */}
                    <Card className="p-6 rounded-2xl shadow-card">
                        <h2 className="text-xl font-semibold mb-4">
                            Product Images <span className="text-destructive">*</span>
                        </h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            Upload up to 5 high-quality images of your product
                        </p>

                        <div className="grid grid-cols-5 gap-4">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-border">
                                    <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-6 w-6 rounded-full"
                                        onClick={() => removeImage(index)}
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}

                            {imageFiles.length < 5 && (
                                <label className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer flex items-center justify-center">
                                    <div className="text-center">
                                        <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Add Image</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        multiple
                                    />
                                </label>
                            )}
                        </div>
                    </Card>

                    {/* Product Badges */}
                    <Card className="p-6 rounded-2xl shadow-card">
                        <h2 className="text-xl font-semibold mb-4">Product Badges (Optional)</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            Select badges that apply to your product
                        </p>

                        <div className="grid md:grid-cols-3 gap-4">
                            {badges.map(badge => (
                                <div key={badge} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={badge}
                                        checked={formData.badges.includes(badge)}
                                        onCheckedChange={() => handleBadgeToggle(badge)}
                                    />
                                    <label
                                        htmlFor={badge}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {badge.replace(/_/g, ' ')}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Submit Buttons */}
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
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleSubmit(ProductStatus.DRAFT)}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save as Draft'
                            )}
                        </Button>
                        <Button
                            type="button"
                            className="flex-1 bg-[#0aad0a] hover:bg-[#089808]"
                            onClick={() => handleSubmit(ProductStatus.WAITING_FOR_REVIEW)}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit for Review'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}