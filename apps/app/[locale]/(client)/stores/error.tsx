"use client";

import { StoresError } from "@/components/client/stores/StoresError";
import { useEffect } from "react";

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
            <StoresError error={error} reset={reset} />
        </div>
    );
}