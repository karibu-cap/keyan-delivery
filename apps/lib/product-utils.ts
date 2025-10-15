import { ProductStatus } from "@prisma/client";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  XCircle
} from "lucide-react";

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    [ProductStatus.VERIFIED]: 'bg-success text-success-foreground',
    [ProductStatus.DRAFT]: 'bg-muted text-muted-foreground',
    [ProductStatus.REJECTED]: 'bg-destructive text-destructive-foreground',
    [ProductStatus.WAITING_FOR_REVIEW]: 'bg-warning text-warning-foreground',
  };

  return statusColors[status] || 'bg-muted text-muted-foreground';
}

export function getStatusIcon(status: string) {
  const statusIcons: Record<string, any> = {
    [ProductStatus.VERIFIED]: CheckCircle,
    [ProductStatus.DRAFT]: Edit,
    [ProductStatus.REJECTED]: XCircle,
    [ProductStatus.WAITING_FOR_REVIEW]: AlertCircle,
  };

  return statusIcons[status] || Clock;
}

export function getStatusName(status: string): string {
  const statusNames: Record<string, string> = {
    [ProductStatus.VERIFIED]: 'Verified',
    [ProductStatus.DRAFT]: 'Draft',
    [ProductStatus.REJECTED]: 'Rejected',
    [ProductStatus.WAITING_FOR_REVIEW]: 'Waiting for Review',
  };

  return statusNames[status] || 'Unknown';
}

export function isLowStock(quantity: number | undefined, threshold: number | undefined): boolean {
  const qty = quantity ?? 0;
  const thresh = threshold ?? 0;
  return qty <= thresh;
}