import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Instacart-specific badge variants
        bestSeller: "border-transparent bg-accent text-white hover:bg-accent/90",
        inStock: "border-transparent bg-success text-white",
        manyInStock: "border-transparent bg-success text-white",
        organic: "border-transparent bg-success text-white",
        nonGMO: "border-transparent bg-primary text-white",
        lowFat: "border-border bg-background text-muted-foreground",
        noPreservatives: "border-border bg-background text-muted-foreground",
        noArtificialFlavors: "border-border bg-background text-muted-foreground",
        sale: "border-transparent bg-warning text-warning-foreground",
        new: "border-border bg-background text-primary",
        promotional: "border-transparent bg-warning text-warning-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
