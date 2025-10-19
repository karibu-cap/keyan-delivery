import { Badge } from "@/components/ui/badge";

interface ProductsStatsProps {
     stats: {
          verified: number;
          draft: number;
          rejected: number;
          waitingForReview: number;
          lowStock: number;
     };
     totalProducts: number;
     filteredCount: number;
}

export default function ProductsStats({
     stats,
     totalProducts,
     filteredCount
}: ProductsStatsProps) {
     return (
          <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
               <p className="text-sm text-muted-foreground">
                    Showing {filteredCount} of {totalProducts} products
               </p>

               <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                         {stats.verified} Active
                    </Badge>
                    <Badge variant="outline" className="bg-muted/50">
                         {stats.draft} Draft
                    </Badge>
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                         {stats.rejected} Rejected
                    </Badge>
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                         {stats.waitingForReview} Pending Review
                    </Badge>
                    {stats.lowStock > 0 && (
                         <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 animate-pulse">
                              {stats.lowStock} Low Stock
                         </Badge>
                    )}
               </div>
          </div>
     );
}