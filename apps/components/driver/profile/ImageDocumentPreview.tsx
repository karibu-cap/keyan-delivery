// components/driver/profile/ImageDocumentPreview.tsx
// Image-only document preview with modal view and Cloudinary support

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, X, ZoomIn, ZoomOut } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/hooks/use-inline-translation";

export interface ImageDocumentData {
    id: string;
    name: string;
    url: string;
    uploadedAt?: Date;
    status: "approved" | "rejected" | "pending" | "banned";
}

interface ImageDocumentPreviewProps {
    document: ImageDocumentData;
    showActions?: boolean;
}

export function ImageDocumentPreview({
    document,
    showActions = true,
}: ImageDocumentPreviewProps) {
    const [showModal, setShowModal] = useState(false);
    const [zoom, setZoom] = useState(100);
    const t = useT();
    const { toast } = useToast();

    const handleDownload = async () => {
        try {
            const response = await fetch(document.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = window.document.createElement("a");
            link.href = url;
            link.download = document.name || "document.jpg";
            link.click();
            window.URL.revokeObjectURL(url);
            toast({
                title: t("Document downloaded successfully!"),
                description: t("You've downloaded successfully the document."),
                variant: 'default',
            });
        } catch (error) {
            toast({
                title: t("Failed to download image"),
                description: t("Make sure you are connected and retry"),
                variant: 'destructive',
            });
            console.error("Failed to download image:", error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved":
                return "bg-green-100 text-green-800 border-green-200";
            case "rejected":
                return "bg-red-100 text-red-800 border-red-200";
            case "banned":
                return "bg-red-100 text-red-800 border-red-200";
            case "pending":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <>
            <Card className="p-3 rounded-2xl shadow-card hover:shadow-lg transition-all">
                <div className="space-y-3">
                    {/* Image Preview */}
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                        <img
                            src={document.url}
                            alt={document.name}
                            className="max-w-full max-h-full object-contain"
                        />

                        {/* Status Badge */}
                        <div className="absolute top-2 right-2 z-10">
                            <Badge className={`text-xs ${getStatusColor(document.status)}`}>
                                {document.status}
                            </Badge>
                        </div>
                    </div>

                    {/* Document Info */}
                    <div className="space-y-2">
                        <h3
                            className="font-medium text-sm truncate"
                            title={document.name}
                        >
                            {document.name}
                        </h3>

                        {document.uploadedAt && (
                            <p className="text-xs text-muted-foreground">
                                Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    {showActions && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowModal(true)}
                                className="flex-1 text-xs"
                            >
                                <Eye className="w-3 h-3 mr-1" />
                                View
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownload}
                                className="flex-1 text-xs"
                            >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                            </Button>
                        </div>
                    )}
                </div>
            </Card>


            {/* Full View Modal */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                    <DialogHeader className="">
                        <div className="flex items-center justify-between py-5">
                            <DialogTitle>{document.name}</DialogTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setZoom(Math.max(50, zoom - 25))}
                                    disabled={zoom <= 10}
                                >
                                    <ZoomOut className="w-4 h-4" />
                                </Button>
                                <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                                    {zoom}%
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setZoom(Math.min(200, zoom + 25))}
                                    disabled={zoom >= 200}
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleDownload}
                                >
                                    <Download className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="overflow-auto max-h-[calc(90vh-120px)]">
                        <div className="relative min-h-[400px] flex items-center justify-center p-4">
                            <img
                                src={document.url}
                                alt={document.name}
                                style={{
                                    width: `${zoom}%`,
                                    height: "auto",
                                    maxWidth: "none",
                                }}
                                className="rounded-lg"
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
