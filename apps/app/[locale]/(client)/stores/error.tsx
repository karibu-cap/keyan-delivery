"use client";

import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import { StoresError } from "@/components/client/stores/StoresError";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Stores page error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <StoresError error={error} reset={reset} />
        </div>
    );
}