export function StoreDetailLoading() {
    return (
        <div className="animate-pulse">
            <div className="bg-white border-b border-gray-200 p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                        <div className="flex-1">
                            <div className="h-6 w-48 bg-gray-200 rounded mb-2" />
                            <div className="h-4 w-32 bg-gray-200 rounded" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg p-3 border">
                            <div className="aspect-square bg-gray-200 rounded-lg mb-3" />
                            <div className="h-4 bg-gray-200 rounded mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}