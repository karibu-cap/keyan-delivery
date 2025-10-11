"use client";

import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/use-inline-translation";
import { X } from "lucide-react";
import { useEffect } from "react";

interface Aisle {
    id: string;
    name: string;
    count: number;
}

interface MobileCategoryDrawerProps {
    aisles: Aisle[];
    selectedCategory: string;
    onCategorySelect: (category: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

export function MobileCategoryDrawer({
    aisles,
    selectedCategory,
    onCategorySelect,
    isOpen,
    onClose,
}: MobileCategoryDrawerProps) {
    const t = useT()

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            <div
                className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform">
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">{t("Browse aisles")}</h3>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-1">
                            <button
                                onClick={() => {
                                    onCategorySelect("");
                                    onClose();
                                }}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedCategory === ""
                                    ? "bg-gray-900 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                {t("All Products")}
                            </button>
                            {aisles.map((aisle) => (
                                <button
                                    key={aisle.id}
                                    onClick={() => {
                                        onCategorySelect(aisle.name);
                                        onClose();
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedCategory === aisle.name
                                        ? "bg-gray-900 text-white"
                                        : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    {aisle.name}
                                    <span className="ml-2 text-xs opacity-70">
                                        ({aisle.count})
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}