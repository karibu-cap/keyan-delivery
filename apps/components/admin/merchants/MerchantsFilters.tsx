"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useT } from "@/hooks/use-inline-translation";

interface MerchantsFiltersProps {
    defaultValues: {
        search?: string;
        status?: string;
    };
}

export function MerchantsFilters({ defaultValues }: MerchantsFiltersProps) {
    const router = useRouter();
    const t = useT()

    const searchParams = useSearchParams();
    const [search, setSearch] = useState(defaultValues.search || "");
    const [status, setStatus] = useState(defaultValues.status || "all");

    const handleFilter = () => {
        const params = new URLSearchParams(searchParams);
        if (search) {
            params.set("search", search);
        } else {
            params.delete("search");
        }
        if (status && status !== "all") {
            params.set("status", status);
        } else {
            params.delete("status");
        }
        params.delete("page"); // Reset to page 1
        router.push(`?${params.toString()}`);
    };

    const handleReset = () => {
        setSearch("");
        setStatus("all");
        router.push("/admin/merchants");
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by business name or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleFilter()}
                    className="pl-10"
                />
            </div>
            <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t("All Status")}</SelectItem>
                    <SelectItem value="verified">{t("Verified")}</SelectItem>
                    <SelectItem value="pending">{t("Pending")}</SelectItem>
                </SelectContent>
            </Select>
            <Button onClick={handleFilter}>{t("Apply Filters")}</Button>
            {(search || status !== "all") && (
                <Button variant="outline" onClick={handleReset}>
                    <X className="h-4 w-4 mr-2" />
                    {t("Reset")}
                </Button>
            )}
        </div>
    );
}