"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MapPin, MoreVertical, Edit, Trash2, Search, DollarSign, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useT } from "@/hooks/use-inline-translation";
import { deleteZone } from "@/lib/actions/server/admin/zones";
import { useToast } from "@/hooks/use-toast";
import type { DeliveryZone, ZoneStatus } from "@prisma/client";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ZonesListProps {
    zones: DeliveryZone[];
}

export default function ZonesList({ zones }: ZonesListProps) {
    const t = useT();
    const router = useRouter();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [zoneToDelete, setZoneToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter zones
    const filteredZones = zones.filter((zone) => {
        const matchesSearch =
            zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            zone.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || zone.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleDelete = async () => {
        if (!zoneToDelete) return;

        setIsDeleting(true);
        try {
            await deleteZone(zoneToDelete);
            toast({
                title: t("Zone deleted"),
                description: t("Delivery zone has been deleted successfully"),
            });
            router.refresh();
        } catch (error: any) {
            toast({
                title: t("Error"),
                description: error.message || t("Failed to delete zone"),
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setZoneToDelete(null);
        }
    };

    const getStatusColor = (status: ZoneStatus) => {
        switch (status) {
            case "ACTIVE":
                return "bg-green-500/10 text-green-700 border-green-500/20";
            case "INACTIVE":
                return "bg-gray-500/10 text-gray-700 border-gray-500/20";
            default:
                return "bg-blue-500/10 text-blue-700 border-blue-500/20";
        }
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t("Search zones by name or code...")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder={t("Filter by status")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("All Statuses")}</SelectItem>
                        <SelectItem value="ACTIVE">{t("Active")}</SelectItem>
                        <SelectItem value="INACTIVE">{t("Inactive")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Results count */}
            <div className="text-sm text-muted-foreground">
                {t("Showing {count} zones", { count: filteredZones.length })}
            </div>

            {/* Zones Grid */}
            {filteredZones.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="flex flex-col items-center justify-center text-center">
                            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">{t("No zones found")}</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {searchQuery
                                    ? t("Try adjusting your search or filters")
                                    : t("Create your first delivery zone to get started")}
                            </p>
                            {!searchQuery && (
                                <Button onClick={() => router.push("/admin/zones/new")} type="button">
                                    {t("Create Zone")}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredZones.map((zone) => (
                        <Card key={zone.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6 space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg">{zone.name}</h3>
                                            <Badge
                                                variant="outline"
                                                className={getStatusColor(zone.status)}
                                            >
                                                {zone.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{zone.code}</p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" type="button">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => router.push(`/admin/zones/${zone.id}/edit`)}
                                            >
                                                <Edit className="mr-2 h-4 w-4" />
                                                {t("Edit")}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => {
                                                    setZoneToDelete(zone.id);
                                                    setDeleteDialogOpen(true);
                                                }}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                {t("Delete")}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Zone preview - colored box */}
                                <div
                                    className="h-24 rounded-lg border-2 flex items-center justify-center"
                                    style={{
                                        backgroundColor: zone.color ? `${zone.color}20` : undefined,
                                        borderColor: zone.color || undefined,
                                    }}
                                >
                                    <MapPin
                                        className="h-8 w-8"
                                        style={{ color: zone.color || undefined }}
                                    />
                                </div>

                                {/* Details */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <DollarSign className="h-3 w-3" />
                                            {t("Delivery Fee")}
                                        </span>
                                        <span className="font-medium">{t.formatAmount(zone.deliveryFee)}</span>
                                    </div>
                                    {zone.estimatedDeliveryMinutes && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {t("Est. Time")}
                                            </span>
                                            <span className="font-medium">
                                                {zone.estimatedDeliveryMinutes} {t("min")}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {t("Landmarks")}
                                        </span>
                                        <span className="font-medium">{zone.landmarks?.length || 0}</span>
                                    </div>
                                </div>

                                {/* Description */}
                                {zone.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {zone.description}
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        type="button"
                                        className="flex-1"
                                        onClick={() => router.push(`/admin/zones/${zone.id}/edit`)}
                                    >
                                        <Edit className="mr-2 h-3 w-3" />
                                        {t("Edit")}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("Delete Zone")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("Are you sure you want to delete this delivery zone? This action cannot be undone. Zones with existing orders cannot be deleted.")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            {t("Cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? t("Deleting...") : t("Delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}