"use client";

import { OptimizedImage } from "@/components/ClsOptimization";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { uploadImages } from "@/lib/actions/client";
import { fetchCategories } from "@/lib/actions/client/stores";
import { getMerchantProducts, updateMerchantProduct } from "@/lib/actions/merchants";
import { ProductBadge } from "@prisma/client";
import { ArrowLeft, Camera, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Category {
     id: string;
     name: string;
}

export default function EditProductPage() {

     const params = useParams<{ merchantId: string, productId: string }>();
     const { toast } = useToast();
     const [isSubmitting, setIsSubmitting] = useState(false);
     const [categories, setCategories] = useState<Category[]>([]);
     const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
     const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

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
          existingImages: [] as string[],
     });

     useEffect(() => {
          _fetchCategories();
          fetchProduct();
     }, [params.productId, params.merchantId]);



     const _fetchCategories = async () => {
          try {
               const res = await fetchCategories({ limit: 100, offset: 0 });
               if (res?.categories?.length > 0) {
                    setCategories(res.categories.filter((c: Category) => c.id !== 'all'));
               }
          } catch (error) {
               console.error('Error fetching categories:', error);
          }
     };

     const fetchProduct = async () => {
          try {
               const res = await getMerchantProducts(params.merchantId, { limit: 1 });
               const data = await res;

               if (data.success && data.products.length > 0) {
                    const product = data.products[0];
                    setFormData({
                         title: product.title,
                         description: product.description || "",
                         price: product.price.toString(),
                         compareAtPrice: product.compareAtPrice?.toString() || "",
                         stock: product.stock.toString(),
                         unit: product.unit || "unit",
                         categoryIds: product.categories?.map((c: { category: { id: string } }) => c.category.id) || [],
                         weight: product.weight?.toString() || "",
                         weightUnit: product.weightUnit || "lb",
                         badges: product.badges || [],
                         existingImages: product.images || [],
                    });
               }
          } catch (error) {
               console.error('Error fetching product:', error);
               toast({
                    title: 'Error',
                    description: 'Failed to load product data',
                    variant: 'destructive'
               });
          }
     };

     const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const files = Array.from(e.target.files || []);
          const totalImages = formData.existingImages.length + newImageFiles.length + files.length;

          if (totalImages > 5) {
               toast({
                    title: 'Too many images',
                    description: 'You can have a maximum of 5 images',
                    variant: 'destructive'
               });
               return;
          }

          setNewImageFiles([...newImageFiles, ...files]);

          files.forEach(file => {
               const reader = new FileReader();
               reader.onloadend = () => {
                    setNewImagePreviews(prev => [...prev, reader.result as string]);
               };
               reader.readAsDataURL(file);
          });
     };

     const removeExistingImage = (index: number) => {
          setFormData(prev => ({
               ...prev,
               existingImages: prev.existingImages.filter((_, i) => i !== index)
          }));
     };

     const removeNewImage = (index: number) => {
          setNewImageFiles(prev => prev.filter((_, i) => i !== index));
          setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
     };

     const handleBadgeToggle = (badge: ProductBadge) => {
          setFormData(prev => ({
               ...prev,
               badges: prev.badges.includes(badge)
                    ? prev.badges.filter(b => b !== badge)
                    : [...prev.badges, badge]
          }));
     };

     const handleSubmit = async () => {
          if (!formData.title || !formData.description || !formData.price || !formData.stock) {
               toast({
                    title: 'Missing fields',
                    description: 'Please fill in all required fields',
                    variant: 'destructive'
               });
               return;
          }

          if (formData.existingImages.length === 0 && newImageFiles.length === 0) {
               toast({
                    title: 'Missing image',
                    description: 'Please have at least one product image',
                    variant: 'destructive'
               });
               return;
          }

          setIsSubmitting(true);

          try {
               const updateData: Record<string, unknown> = {
                    title: formData.title,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
                    stock: parseInt(formData.stock),
                    unit: formData.unit,
                    categoryIds: formData.categoryIds,
                    weight: formData.weight ? parseFloat(formData.weight) : null,
                    weightUnit: formData.weightUnit,
                    badges: formData.badges,
               };

               // Upload new images if any
               if (newImageFiles.length > 0) {
                    const uploadedMedia = await uploadImages(newImageFiles);
                    if (!uploadedMedia || uploadedMedia.length === 0) {
                         throw new Error("Failed to upload images");
                    }

                    // If this is the first image or replacing the main image
                    if (formData.existingImages.length === 0) {
                         updateData.mediaId = uploadedMedia[0].id;
                    }

                    // Combine existing and new images
                    updateData.images = [
                         ...formData.existingImages,
                         ...uploadedMedia.map(m => m.url)
                    ];
               } else {
                    updateData.images = formData.existingImages;
               }

               const res = await updateMerchantProduct({
                    id: params.productId,
                    formData: updateData,
                    merchantId: params.merchantId,
               });

               const data = await res.json();

               if (data.success) {
                    toast({
                         title: 'Success!',
                         description: 'Product updated successfully',
                         variant: 'default'
                    });
                    window.location.href = `/merchant/${params.merchantId}/products`;
               } else {
                    toast({
                         title: 'Error',
                         description: data.error,
                         variant: 'destructive'
                    });
               }
          } catch (error) {
               console.error('Error updating product:', error);
               toast({
                    title: 'Error',
                    description: 'Failed to update product',
                    variant: 'destructive'
               });
          } finally {
               setIsSubmitting(false);
          }
     };

     const badges = Object.values(ProductBadge);

     return (
          <div className="min-h-screen bg-background">
               <div className="container mx-auto max-w-4xl px-4 py-8">
                    <Link
                         href={`/merchant/${params.merchantId}/products`}
                         className="inline-flex items-center text-foreground mb-6 hover:text-primary transition-colors"
                    >
                         <ArrowLeft className="w-4 h-4 mr-2" />
                         Back to Products
                    </Link>

                    <div className="mb-8">
                         <h1 className="text-4xl font-bold mb-2">Edit Product</h1>
                         <p className="text-muted-foreground">
                              Update your product information
                         </p>
                    </div>

                    <div className="space-y-6">
                         <Card className="p-6 rounded-2xl shadow-card">
                              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

                              <div className="space-y-4">
                                   <div>
                                        <Label htmlFor="title">
                                             Product Name <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                             id="title"
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
                                             value={formData.price}
                                             onChange={(e) =>
                                                  setFormData({ ...formData, price: e.target.value })
                                             }
                                             className="mt-2"
                                        />
                                   </div>

                                   <div>
                                        <Label htmlFor="compareAtPrice">Compare at Price</Label>
                                        <Input
                                             id="compareAtPrice"
                                             type="number"
                                             step="0.01"
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
                                        <Label htmlFor="weight">Weight</Label>
                                        <Input
                                             id="weight"
                                             type="number"
                                             step="0.01"
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

                         <Card className="p-6 rounded-2xl shadow-card">
                              <h2 className="text-xl font-semibold mb-4">Product Images</h2>
                              <p className="text-sm text-muted-foreground mb-4">
                                   Manage your product images (up to 5 total)
                              </p>

                              <div className="grid grid-cols-5 gap-4">
                                   {formData.existingImages.map((image, index) => (
                                        <div key={`existing-${index}`} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-border">
                                             <OptimizedImage
                                                  src={image}
                                                  alt={`Existing ${index + 1}`}
                                                  fill
                                                  className="w-full h-full object-cover"
                                             />
                                             <Button
                                                  type="button"
                                                  variant="destructive"
                                                  size="icon"
                                                  className="absolute top-2 right-2 h-6 w-6 rounded-full"
                                                  onClick={() => removeExistingImage(index)}
                                             >
                                                  <X className="w-3 h-3" />
                                             </Button>
                                        </div>
                                   ))}

                                   {newImagePreviews.map((preview, index) => (
                                        <div key={`new-${index}`} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-primary-500">
                                             <OptimizedImage
                                                  src={preview}
                                                  alt={`New ${index + 1}`}
                                                  fill
                                                  className="w-full h-full object-cover"
                                             />
                                             <Button
                                                  type="button"
                                                  variant="destructive"
                                                  size="icon"
                                                  className="absolute top-2 right-2 h-6 w-6 rounded-full"
                                                  onClick={() => removeNewImage(index)}
                                             >
                                                  <X className="w-3 h-3" />
                                             </Button>
                                        </div>
                                   ))}

                                   {(formData.existingImages.length + newImageFiles.length) < 5 && (
                                        <label className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer flex items-center justify-center">
                                             <div className="text-center">
                                                  <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                                  <span className="text-xs text-muted-foreground">Add</span>
                                             </div>
                                             <input
                                                  type="file"
                                                  accept="image/*"
                                                  onChange={handleNewImageChange}
                                                  className="hidden"
                                                  multiple
                                             />
                                        </label>
                                   )}
                              </div>
                         </Card>

                         <Card className="p-6 rounded-2xl shadow-card">
                              <h2 className="text-xl font-semibold mb-4">Product Badges</h2>

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

                         <div className="flex gap-4">
                              <Button
                                   type="button"
                                   variant="outline"
                                   className="flex-1"
                                   onClick={() => window.history.back()}
                                   disabled={isSubmitting}
                              >
                                   Cancel
                              </Button>
                              <Button
                                   type="button"
                                   className="flex-1 bg-primary hover:bg-[#089808]"
                                   onClick={handleSubmit}
                                   disabled={isSubmitting}
                              >
                                   {isSubmitting ? (
                                        <>
                                             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                             Updating...
                                        </>
                                   ) : (
                                        'Update Product'
                                   )}
                              </Button>
                         </div>
                    </div>
               </div>
          </div>
     );
}