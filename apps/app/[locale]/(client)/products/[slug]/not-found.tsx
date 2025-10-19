import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PackageX } from "lucide-react";
import Link from "next/link";

export default function ProductNotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <PackageX className="w-10 h-10 text-gray-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
                    <p className="text-gray-600 mb-6">
                        Sorry, we couldn't find the product you're looking for. It may have been removed or is no longer available.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button asChild variant="default">
                            <Link href="/stores">Browse Stores</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/">Go Home</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
