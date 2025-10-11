import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Store, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto max-w-7xl px-4 py-20">
                <div className="text-center">
                    <Store className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Store Not Found
                    </h1>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        The store you&apos;re looking for doesn&apos;t exist or is currently
                        unavailable.
                    </p>
                    <Link href="/stores">
                        <Button className="bg-primary hover:bg-primary/90">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Stores
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}