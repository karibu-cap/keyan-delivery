'use client'
import { Input } from "@/components/ui/input";
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { ProductStatus } from "@prisma/client";
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
     onStatusChange
}: ProductsFiltersProps) {
     const t = useT()
     return (
          <div className="flex flex-col md:flex-row gap-4 mb-6">
               <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                         placeholder="Search products by name or category..."
                         value={searchQuery}
                         onChange={(e) => onSearchChange(e.target.value)}
                         className="pl-10"
                    />
               </div>

               <Select value={statusFilter} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-full md:w-48">
                         <SelectValue placeholder={t("Filter by status")} />
                    </SelectTrigger>
                    <SelectContent>
                         <SelectItem value="ALL">{t("All Status")}</SelectItem>
                         <SelectItem value={ProductStatus.VERIFIED}>{t("Verified")}</SelectItem>
                         <SelectItem value={ProductStatus.DRAFT}>{t("Draft")}</SelectItem>
                         <SelectItem value={ProductStatus.REJECTED}>{t("Rejected")}</SelectItem>
                         <SelectItem value={ProductStatus.WAITING_FOR_REVIEW}>{t("Waiting for Review")}</SelectItem>
                    </SelectContent>
               </Select>
          </div>
     );
}