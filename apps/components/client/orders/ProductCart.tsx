import { Card, CardContent } from "@/components/ui/card"
import { OptimizedImage } from "@/components/ClsOptimization"
import { useT } from "@/hooks/use-inline-translation"
import { IProduct } from "@/types/generic_types"
interface ProductCardProps {
    product: IProduct
}

export function ProductCard({ product }: ProductCardProps) {
    const t = useT()

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
                    <div className="text-lg font-bold text-primary">{t.formatAmount(product.price)}</div>
                </div>
            </CardContent>
        </Card>
    )
}
