import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ClsOptimization";

export default function ProductLoading() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb Skeleton */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-3">
                    <Skeleton width="300px" height="h-4" />
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 lg:py-8">
                {/* Back Button Skeleton */}
                <Skeleton width="100px" height="h-10" className="mb-4" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Image Gallery Skeleton */}
                    <div>
                        <Card className="overflow-hidden">
                            <CardContent className="p-0">
                                <Skeleton variant="rectangular" className="aspect-square" />
                                <div className="p-4 bg-white">
                                    <div className="grid grid-cols-5 gap-2">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Skeleton key={i} variant="rectangular" className="aspect-square" />
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Product Info Skeleton */}
                    <div className="space-y-6">
                        {/* Store Info Skeleton */}
                        <Card>
                            <CardContent className="p-3 flex items-center space-x-3">
                                <Skeleton variant="circular" width="48px" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton width="150px" height="h-5" />
                                    <Skeleton width="100px" height="h-4" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6 space-y-4">
                                {/* Title */}
                                <div className="space-y-2">
                                    <Skeleton lines={2} height="h-8" />
                                    <div className="flex gap-2">
                                        <Skeleton width="80px" height="h-6" />
                                        <Skeleton width="80px" height="h-6" />
                                    </div>
                                </div>

                                <div className="h-px bg-gray-200" />

                                {/* Price */}
                                <div className="space-y-2">
                                    <Skeleton width="150px" height="h-10" />
                                    <Skeleton width="100px" height="h-4" />
                                </div>

                                <div className="h-px bg-gray-200" />

                                {/* Stock */}
                                <Skeleton width="120px" height="h-6" />

                                {/* Add to Cart Button */}
                                <Skeleton variant="rectangular" height="h-12" />

                                {/* Delivery Info */}
                                <div className="space-y-3 pt-4">
                                    <div className="flex items-start space-x-3">
                                        <Skeleton variant="circular" width="20px" />
                                        <div className="flex-1 space-y-1">
                                            <Skeleton width="120px" height="h-4" />
                                            <Skeleton width="200px" height="h-4" />
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Skeleton variant="circular" width="20px" />
                                        <div className="flex-1 space-y-1">
                                            <Skeleton width="120px" height="h-4" />
                                            <Skeleton width="200px" height="h-4" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Description Skeleton */}
                <Card className="mb-12">
                    <CardContent className="p-6">
                        <Skeleton width="200px" height="h-6" className="mb-4" />
                        <Skeleton lines={4} height="h-4" />
                    </CardContent>
                </Card>

                {/* Related Products Skeleton */}
                <div className="space-y-6">
                    <Skeleton width="200px" height="h-8" />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i} className="overflow-hidden">
                                <Skeleton variant="rectangular" className="aspect-square" />
                                <div className="p-3 space-y-2">
                                    <Skeleton lines={2} height="h-4" />
                                    <Skeleton width="60px" height="h-5" />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
