"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, AlertCircle } from "lucide-react";
import { OptimizedImage } from "@/components/ClsOptimization";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useT } from "@/hooks/use-inline-translation";

interface DriverDocumentsProps {
    driver: {
        cni: string | null;
        driverDocument: string | null;
        driverStatus: string | null;
    };
}

export function DriverDocuments({ driver }: DriverDocumentsProps) {
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const t = useT()
    const hasAllDocuments = driver.cni && driver.driverDocument;

    return (
        <div className="space-y-4">
            {/* Missing Documents Alert */}
            {!hasAllDocuments && driver.driverStatus === "PENDING" && (
                <Alert variant="destructive" className="border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                        <strong>{t("Missing documents")}</strong> {t("Driver must upload both CNI and driver's license before approval.")}
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                {/* CNI Document */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{t("CNI (National ID)")}</CardTitle>
                            <Badge variant={driver.cni ? "default" : "secondary"}>
                                {driver.cni ? "Uploaded" : "Missing"}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {driver.cni ? (
                            <div className="space-y-3">
                                <div className="relative h-48 w-full rounded-lg overflow-hidden bg-muted border">
                                    <OptimizedImage
                                        src={driver.cni}
                                        alt="CNI Document"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPreviewImage(driver.cni)}
                                        className="flex-1"
                                    >
                                        <Eye className="mr-2 h-4 w-4" />
                                        {t("Preview")}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        className="flex-1"
                                    >
                                        <a
                                            href={driver.cni}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            {t("Download")}
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                <FileText className="h-12 w-12 mb-2" />
                                <p className="text-sm">{t("No CNI uploaded")}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Driver License Document */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{t("Driver's License")}</CardTitle>
                            <Badge variant={driver.driverDocument ? "default" : "secondary"}>
                                {driver.driverDocument ? "Uploaded" : "Missing"}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {driver.driverDocument ? (
                            <div className="space-y-3">
                                <div className="relative h-48 w-full rounded-lg overflow-hidden bg-muted border">
                                    <OptimizedImage
                                        src={driver.driverDocument}
                                        alt="Driver License"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPreviewImage(driver.driverDocument)}
                                        className="flex-1"
                                    >
                                        <Eye className="mr-2 h-4 w-4" />
                                        {t("Preview")}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        className="flex-1"
                                    >
                                        <a
                                            href={driver.driverDocument}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            {t("Download")}
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                <FileText className="h-12 w-12 mb-2" />
                                <p className="text-sm">{t("No license uploaded")}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Document Preview Dialog */}
            <Dialog open={previewImage !== null} onOpenChange={() => setPreviewImage(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{t("Document Preview")}</DialogTitle>
                    </DialogHeader>
                    {previewImage && (
                        <div className="relative h-[600px] w-full">
                            <OptimizedImage
                                src={previewImage}
                                alt="Document Preview"
                                fill
                                className="object-contain"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}