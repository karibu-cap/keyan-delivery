"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OptimizedImage } from "@/components/ClsOptimization";
import { useState } from "react";
import { Package } from "lucide-react";
import { useT } from "@/hooks/use-inline-translation";

interface ProductImagesProps {
    images: Array<{ url: string; id: string }>;
    title: string;
}

export function ProductImages({ images, title }: ProductImagesProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const t = useT();

    if (images.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t("Product Images")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-96 bg-muted rounded-lg">
                        <Package className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">{t("No images uploaded")}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("Product Images")} ({images.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Main Image */}
                <div className="relative h-96 w-full rounded-lg overflow-hidden bg-muted">
                    <OptimizedImage
                        src={images[selectedImage].url}
                        alt={`${title} - Image ${selectedImage + 1}`}
                        fill
                        className="object-contain"
                    />
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                        {images.map((image, index) => (
                            <button
                                key={image.id}
                                onClick={() => setSelectedImage(index)}
                                className={`relative h-20 w-full rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                                    ? "border-primary ring-2 ring-primary"
                                    : "border-transparent hover:border-muted-foreground"
                                    }`}
                            >
                                <OptimizedImage
                                    src={image.url}
                                    alt={`${title} - Thumbnail ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}