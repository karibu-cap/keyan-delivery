"use client";

import { useT } from "@/hooks/use-inline-translation";

interface Aisle {
    id: string;
    name: string;
    count: number;
}

interface CategorySidebarProps {
    aisles: Aisle[];
    selectedCategory: string;
    onCategorySelect: (category: string) => void;
}

export function CategorySidebar({
    aisles,
    selectedCategory,
    onCategorySelect,
}: CategorySidebarProps) {

    const t = useT()
    return (
        <div className="w-60 bg-white border-r border-gray-200 sticky top-32 h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4"> {t("Browse aisles")}</h3>
                <div className="space-y-1">
                    <button
                        onClick={() => onCategorySelect("")}
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
                            onClick={() => onCategorySelect(aisle.name)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedCategory === aisle.name
                                ? "bg-gray-900 text-white"
                                : "text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            {aisle.name}
                            <span className="ml-2 text-xs opacity-70">({aisle.count})</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}