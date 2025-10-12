"use client";

import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/use-inline-translation";
import { AlertCircle } from "lucide-react";

interface StoresErrorProps {
    error: Error;
    reset: () => void;
}

export function StoresError({ error, reset }: StoresErrorProps) {
    const t = useT()
    return (
        <section className="py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center py-20">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {t("Oops! Something went wrong")}
                    </h2>
                    <p className="text-gray-600 mb-6">{error.message}</p>
                    <Button onClick={reset} className="bg-primary hover:bg-primary/90">
                        {t("Try again")}
                    </Button>
                </div>
            </div>
        </section>
    );
}