import { getProductDetails } from "@/lib/actions/server/admin/products";
import { ProductInfo } from "@/components/admin/products/ProductInfo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerT } from "@/i18n/server-translations";
import { ProductImages } from "@/components/admin/products/ProductImages";
import { ProductHeader } from "@/components/admin/products/ProductHeader";

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    let data;
    try {
        data = await getProductDetails((await params).id);
    } catch (error) {
        notFound();
    }

    const { product } = data;
    const t = await getServerT();

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Button variant="ghost" asChild>
                <Link href="/admin/products">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("Back to Products")}
                </Link>
            </Button>

            {/* Product Header */}
            <ProductHeader product={product} />

            {/* Product Content */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Images */}
                <ProductImages images={product.images} title={product.title} />

                {/* Product Info */}
                <ProductInfo product={product} />
            </div>
        </div>
    );
}