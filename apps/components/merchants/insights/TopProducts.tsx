'use client';

import { TrendingUp } from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';
import { OptimizedImage } from '@/components/ClsOptimization';

interface Product {
    productId: string;
    name: string;
    image: string | null;
    quantity: number;
    revenue: number;
    orders: number;
}

interface TopProductsProps {
    products: Product[];
}

export default function TopProducts({ products }: TopProductsProps) {
    const t = useT();
    return (
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        {t('Most sold products')}
                    </h2>
                    <p className="text-sm text-gray-500">{t('Top 10 products')}</p>
                </div>
                <TrendingUp className="h-5 w-5 text-primary/60" />
            </div>

            <div className="space-y-4">
                {products.length === 0 ? (
                    <p className="py-8 text-center text-sm text-gray-500">
                        {t('No sales data available')}
                    </p>
                ) : (
                    products.map((product, index) => (
                        <div
                            key={product.productId}
                            className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-all hover:border-blue-300 hover:shadow-sm"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-600">
                                    #{index + 1}
                                </div>

                                {product.image && (
                                    <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                                        <OptimizedImage
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}

                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {product.orders} {t('order')}{product.orders > 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="font-semibold text-gray-900">
                                    ${product.revenue.toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {product.quantity} {t('sold')}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}