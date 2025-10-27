"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Edit, Trash2, Loader2, Star, Search } from "lucide-react";
import { useT } from "@/hooks/use-inline-translation";
import { geocodeAddress } from "@/lib/actions/server/admin/zones";
import type { Landmark } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

interface LandmarksManagerProps {
    landmarks: Landmark[];
    onChange: (landmarks: Landmark[]) => void;
    zoneId?: string;
}

const LANDMARK_CATEGORIES = [
    { value: "supermarket", label: "Supermarket" },
    { value: "station", label: "Station" },
    { value: "market", label: "Market" },
    { value: "restaurant", label: "Restaurant" },
    { value: "school", label: "School" },
    { value: "hospital", label: "Hospital" },
    { value: "church", label: "Church" },
    { value: "mosque", label: "Mosque" },
    { value: "general", label: "General" },
];

export default function LandmarksManager({ landmarks, onChange, zoneId }: LandmarksManagerProps) {
    const t = useT();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isGeocoding, setIsGeocoding] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        category: "general",
        isPopular: false,
        coordinates: { lat: 0, lng: 0 },
    });

    const handleAddLandmark = () => {
        setEditingIndex(null);
        setFormData({
            name: "",
            address: "",
            category: "general",
            isPopular: false,
            coordinates: { lat: 0, lng: 0 },
        });
        setDialogOpen(true);
    };

    const handleEditLandmark = (index: number) => {
        const landmark = landmarks[index];
        setEditingIndex(index);
        setFormData({
            name: landmark.name,
            address: "",
            category: landmark.category || "general",
            isPopular: landmark.isPopular,
            coordinates: landmark.coordinates,
        });
        setDialogOpen(true);
    };

    const handleGeocode = async () => {
        if (!formData.address.trim()) {
            toast({
                title: t("Error"),
                description: t("Please enter an address"),
                variant: "destructive",
            });
            return;
        }

        setIsGeocoding(true);
        try {
            const coordinates = await geocodeAddress(formData.address);
            if (coordinates) {
                setFormData({ ...formData, coordinates });
                toast({
                    title: t("Success"),
                    description: t("Address geocoded successfully"),
                });
            } else {
                toast({
                    title: t("Error"),
                    description: t("Could not geocode the address. Please try a different address."),
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: t("Error"),
                description: t("Failed to geocode address"),
                variant: "destructive",
            });
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleSaveLandmark = () => {
        if (!formData.name.trim()) {
            toast({
                title: t("Error"),
                description: t("Landmark name is required"),
                variant: "destructive",
            });
            return;
        }

        if (formData.coordinates.lat === 0 && formData.coordinates.lng === 0) {
            toast({
                title: t("Error"),
                description: t("Please geocode the address first"),
                variant: "destructive",
            });
            return;
        }

        // Check for duplicate names
        const isDuplicate = landmarks.some(
            (lm, idx) =>
                lm.name.toLowerCase() === formData.name.toLowerCase() && idx !== editingIndex
        );

        if (isDuplicate) {
            toast({
                title: t("Error"),
                description: t("A landmark with this name already exists"),
                variant: "destructive",
            });
            return;
        }

        const newLandmark: Landmark = {
            name: formData.name,
            coordinates: formData.coordinates,
            category: formData.category,
            isPopular: formData.isPopular,
        };

        if (editingIndex !== null) {
            // Update existing landmark
            const updatedLandmarks = [...landmarks];
            updatedLandmarks[editingIndex] = newLandmark;
            onChange(updatedLandmarks);
        } else {
            // Add new landmark
            onChange([...landmarks, newLandmark]);
        }

        setDialogOpen(false);
    };

    const handleDeleteLandmark = (index: number) => {
        const updatedLandmarks = landmarks.filter((_, idx) => idx !== index);
        onChange(updatedLandmarks);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        {t("Landmarks")}
                    </CardTitle>
                    <Button onClick={handleAddLandmark} size="sm" className="gap-2" type="button">
                        <Plus className="h-4 w-4" />
                        {t("Add Landmark")}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
                {landmarks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>{t("No landmarks added yet")}</p>
                        <p className="text-sm">{t("Add landmarks to help customers locate their delivery address")}</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {landmarks.map((landmark, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold">{landmark.name}</h4>
                                        {landmark.isPopular && (
                                            <Badge variant="secondary" className="gap-1">
                                                <Star className="h-3 w-3 fill-current" />
                                                {t("Popular")}
                                            </Badge>
                                        )}
                                        <Badge variant="outline">{landmark.category}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {t("Coordinates")}: {landmark.coordinates.lat.toFixed(6)},{" "}
                                        {landmark.coordinates.lng.toFixed(6)}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        type="button"
                                        onClick={() => handleEditLandmark(index)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        type="button"
                                        onClick={() => handleDeleteLandmark(index)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingIndex !== null ? t("Edit Landmark") : t("Add Landmark")}
                        </DialogTitle>
                        <DialogDescription>
                            {t("Add a landmark to help customers find their delivery location")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">{t("Landmark Name")} *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder={t("e.g., Central Market")}
                            />
                        </div>

                        <div>
                            <Label htmlFor="address">{t("Address")} *</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) =>
                                        setFormData({ ...formData, address: e.target.value })
                                    }
                                    placeholder={t("Enter address to geocode")}
                                />
                                <Button
                                    type="button"
                                    onClick={handleGeocode}
                                    disabled={isGeocoding}
                                    className="gap-2"
                                >
                                    {isGeocoding ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Search className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t("Click the search button to convert address to coordinates")}
                            </p>
                        </div>

                        {formData.coordinates.lat !== 0 && formData.coordinates.lng !== 0 && (
                            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                    {t("Coordinates found")}:
                                </p>
                                <p className="text-xs text-green-700 dark:text-green-300">
                                    {t("Lat")}: {formData.coordinates.lat.toFixed(6)}, {t("Lng")}:{" "}
                                    {formData.coordinates.lng.toFixed(6)}
                                </p>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="category">{t("Category")}</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {LANDMARK_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isPopular"
                                checked={formData.isPopular}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, isPopular: checked as boolean })
                                }
                            />
                            <Label
                                htmlFor="isPopular"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {t("Mark as popular landmark")}
                            </Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} type="button">
                            {t("Cancel")}
                        </Button>
                        <Button onClick={handleSaveLandmark} type="button">
                            {editingIndex !== null ? t("Update") : t("Add")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}