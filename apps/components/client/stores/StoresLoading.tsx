
import { getServerT } from "@/i18n/server-translations";
import { GridSkeleton } from "@/components/ClsOptimization";

export async function StoresLoading() {

    const t = await getServerT();
    return (
        <>
            <section className="bg-white py-8 px-4 border-b border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="h-6 w-80 bg-gray-200 rounded-lg animate-pulse" />
                        <div className="h-24 w-24 bg-gray-200 rounded-lg animate-pulse" />
                    </div>
                    <div className="flex gap-3 items-center">
                        {/* Category Dropdown Skeleton */}
                        <div className="h-10 w-[200px] bg-gray-200 rounded-md animate-pulse" />
                        {/* Sort By Dropdown Skeleton */}
                        <div className="h-10 w-[200px] bg-gray-200 rounded-md animate-pulse" />
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
