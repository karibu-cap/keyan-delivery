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

interface DriversFiltersProps {
    defaultValues: {
        search?: string;
        status?: string;
    };
}

export function DriversFilters({ defaultValues }: DriversFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(defaultValues.search || "");
    const [status, setStatus] = useState(defaultValues.status || "all");
    const t = useT();

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
        params.delete("page");
        router.push(`?${params.toString()}`);
    };

    const handleReset = () => {
        setSearch("");
        setStatus("all");
        router.push("/admin/drivers");
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={t("Search by name, email, phone, or CNI...")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleFilter()}
                    className="pl-10"
                />
            </div>
            <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder={t("Status")} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t("All Status")}</SelectItem>
                    <SelectItem value="pending">{t("Pending")}</SelectItem>
                    <SelectItem value="approved">{t("Approved")}</SelectItem>
                    <SelectItem value="rejected">{t("Rejected")}</SelectItem>
                    <SelectItem value="banned">{t("Banned")}</SelectItem>
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