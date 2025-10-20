"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Calendar, File, ExternalLink } from "lucide-react";
import PDFViewerComponent from "./PDFViewerComponent";



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
    const [isClient, setIsClient] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [numPages, setNumPages] = useState(1);
    const [pdfLoaded, setPdfLoaded] = useState(false);

    const isImage = document.type.startsWith("image/");
    const isPDF = document.type === "application/pdf";

    // Ensure we only render PDF components on client side
    useEffect(() => {
        setIsClient(true);
    }, []);

    const handlePdfLoad = (event: React.SyntheticEvent<HTMLIFrameElement>) => {
        setPdfLoaded(true);
        console.log("PDF iframe loaded successfully");
    };

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

    return (
        <Card className="p-2 sm:p-3 lg:p-4 rounded-2xl shadow-card hover:shadow-lg transition-all">
            <div className="space-y-2 sm:space-y-3">
                {/* Document Preview */}
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-50">
                    {isImage && document.url ? (
                        <img
                            src={document.url}
                            alt={document.name}
                            className="w-full h-full object-cover"
                        />
                    ) : isPDF && document.url && isClient ? (
                        <div className="w-full h-full bg-white">
                            <PDFViewerComponent url={document.url} />
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <File className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2 z-10">
                        <Badge className={`text-xs ${getStatusColor(document.status)}`}>
                            {document.status}
                        </Badge>
                    </div>
                </div>

                {/* Document Info */}
                <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                        <h3
                            className="font-medium text-xs sm:text-sm truncate flex-1"
                            title={document.name}
                        >
                            {document.name}
                        </h3>
                        {isPDF && (
                            <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">
                            Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
                        </span>
                    </div>

                    {/* PDF Navigation */}
                    {isPDF && pdfLoaded && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>PDF Navigation Available</span>
                                <span className="text-primary">Use PDF toolbar above</span>
                            </div>
                            <div className="flex gap-2 text-xs">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(document.url, "_blank")}
                                    className="flex-1 h-8"
                                >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Full View
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                {showActions && (onView || onDownload || document.url) && (
                    <div className="flex flex-col sm:flex-row gap-2">
                        {(onView || document.url) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleView}
                                className="flex-1 text-xs sm:text-sm"
                            >
                                <Eye className="w-3 h-3 mr-1" />
                                <span>View</span>
                            </Button>
                        )}
                        {(onDownload || document.url) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownload}
                                className="flex-1 text-xs sm:text-sm"
                            >
                                <Download className="w-3 h-3 mr-1" />
                                <span>Download</span>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}
