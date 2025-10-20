import { Card, CardContent } from "@/components/ui/card"
import { IProduct } from "@/lib/actions/server/stores"
import { OptimizedImage } from "@/components/ClsOptimization"
interface ProductCardProps {
    product: IProduct
}

export function ProductCard({ product }: ProductCardProps) {

    return (
        <Card className="overflow-hidden transition-shadow hover:shadow-md">
            <div className="relative h-48 w-full bg-muted">
                <OptimizedImage src={product?.images[0].url || "/icons/ios/542.png"} alt={product.title} fill className="object-cover" blurDataURL={product?.images[0].blurDataUrl || "/icons/ios/542.png"} />
            </div>

            <CardContent className="p-4">
                <div className="mb-2">
                    <h3 className="mb-1 line-clamp-2 font-semibold text-balance">{product.title}</h3>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-primary">${product.price.toFixed(2)}</div>
                </div>
            </CardContent>
        </Card>
    )
}
