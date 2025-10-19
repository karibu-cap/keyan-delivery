import { getLocale } from "next-intl/server";
import { getT } from "@/i18n/server-translations";
import { GridSkeleton } from "@/components/ClsOptimization";

export async function StoresLoading() {
    const locale = await getLocale();
    const t = await getT(locale);
    return (
        <>
            <section className="bg-white py-8 px-4 border-b border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
                        <div className="h-5 w-64 bg-gray-200 rounded-lg animate-pulse" />
                    </div>
                    <div className="flex gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="h-12 w-32 bg-gray-200 rounded-full animate-pulse"
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* CLS-optimized skeleton that matches the actual grid layout */}
                    <GridSkeleton items={12} variant="product" columns={4} />
                </div>
            </section>
        </>
    );
}
