import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ZonesLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Skeleton className="h-9 w-64 mb-2" />
                <Skeleton className="h-5 w-96" />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-32" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-3 w-24" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-[180px]" />
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Zones Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="h-6 w-6 rounded-full" />
                            </div>
                            <Skeleton className="h-24 w-full rounded-lg" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-9 flex-1" />
                                <Skeleton className="h-9 flex-1" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}