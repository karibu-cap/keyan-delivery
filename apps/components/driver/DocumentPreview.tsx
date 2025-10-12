"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Camera, Download, Eye, Calendar, File } from "lucide-react";

export interface DocumentData {
    id: string;
    name: string;
    type: string;
    url?: string;
    uploadedAt: Date;
    status: "approved" | "rejected" | "pending";
}

interface DocumentPreviewProps {
    document: DocumentData;
    onView?: (document: DocumentData) => void;
    onDownload?: (document: DocumentData) => void;
    showActions?: boolean;
}

export function DocumentPreview({
    document,
    onView,
    onDownload,
    showActions = true,
}: DocumentPreviewProps) {
    const isImage = document.type.startsWith("image/");
    const isPDF = document.type === "application/pdf";

    const handleView = () => {
        if (onView) {
            onView(document);
        } else if (document.url) {
            window.open(document.url, "_blank");
        }
    };

    const handleDownload = () => {
        if (onDownload) {
            onDownload(document);
        } else if (document.url) {
            const link = window.document.createElement("a");
            link.href = document.url;
            link.download = document.name;
            link.click();
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved":
                return "bg-green-100 text-green-800 border-green-200";
            case "rejected":
                return "bg-red-100 text-red-800 border-red-200";
            case "pending":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <Card className="p-4 rounded-2xl shadow-card hover:shadow-lg transition-all">
            <div className="space-y-3">
                {/* Document Preview */}
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-50">
                    {isImage && document.url ? (
                        <img
                            src={document.url}
                            alt={document.name}
                            className="w-full h-full object-cover"
                        />
                    ) : isPDF ? (
                        <div className="w-full h-full flex items-center justify-center bg-red-50">
                            <div className="text-center">
                                <FileText className="w-12 h-12 text-red-500 mx-auto mb-2" />
                                <p className="text-sm text-red-700 font-medium">PDF Document</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <File className="w-12 h-12 text-gray-400" />
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                        <Badge className={`text-xs ${getStatusColor(document.status)}`}>
                            {document.status}
                        </Badge>
                    </div>
                </div>

                {/* Document Info */}
                <div className="space-y-2">
                    <div className="flex items-start justify-between">
                        <h3 className="font-medium text-sm truncate" title={document.name}>
                            {document.name}
                        </h3>
                        {isPDF && (
                            <FileText className="w-4 h-4 text-red-500 flex-shrink-0 ml-2" />
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>
                            Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                {showActions && (onView || onDownload || document.url) && (
                    <div className="flex gap-2">
                        {(onView || document.url) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleView}
                                className="flex-1"
                            >
                                <Eye className="w-3 h-3 mr-1" />
                                View
                            </Button>
                        )}
                        {(onDownload || document.url) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownload}
                                className="flex-1"
                            >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}