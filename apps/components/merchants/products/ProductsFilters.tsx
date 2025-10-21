"use client";

import { Input } from "@/components/ui/input";
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { useT } from "@/hooks/use-inline-translation";

interface ProductsFiltersProps {
     searchQuery: string;
     statusFilter: string;
     onSearchChange: (value: string) => void;
     onStatusChange: (value: string) => void;
}

export default function ProductsFilters({
     searchQuery,
     statusFilter,
     onSearchChange,
     onStatusChange,
}: ProductsFiltersProps) {
     const t = useT();

     return (
          <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
               {/* Search Input */}
               <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                         placeholder={t("Search products...")}
                         value={searchQuery}
                         onChange={(e) => onSearchChange(e.target.value)}
                         className="pl-10 h-10 sm:h-11"
                    />
               </div>

               {/* Status Filter */}
               <Select value={statusFilter} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-full sm:w-[200px] h-10 sm:h-11">
                         <Filter className="w-4 h-4 mr-2" />
                         <SelectValue placeholder={t("Filter by status")} />
                    </SelectTrigger>
                    <SelectContent>
                         <SelectItem value="ALL">{t("All Status")}</SelectItem>
                         <SelectItem value="VERIFIED">{t("Verified")}</SelectItem>
                         <SelectItem value="DRAFT">{t("Draft")}</SelectItem>
                         <SelectItem value="REJECTED">{t("Rejected")}</SelectItem>
                         <SelectItem value="WAITING_FOR_REVIEW">{t("Waiting for Review")}</SelectItem>
                    </SelectContent>
               </Select>
          </div>
     );
}