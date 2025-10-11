export function StoresLoading() {
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
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                        <p className="text-gray-600">Loading stores...</p>
                    </div>
                </div>
            </section>
        </>
    );
}
