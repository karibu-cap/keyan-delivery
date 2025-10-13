"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, FileText, Upload } from "lucide-react";
import Navbar from "@/components/Navbar";
import { DocumentUpload } from "./DocumentUpload";
import type { UploadedDocument } from "./DocumentUpload";
import dynamic from "next/dynamic";
import type { DocumentData } from "./DocumentGrid";
import { useToast } from "@/hooks/use-toast";
import { updateDriverDocuments } from "@/lib/actions/client/driver";
import { useAuthStore } from "@/hooks/auth-store";
import { buildExistingDocuments, DocumentInfo } from "@/lib/utils/documents";

// Dynamically import DocumentGrid to avoid SSR issues
const DocumentGrid = dynamic(() => import("./DocumentGrid").then(mod => ({ default: mod.DocumentGrid })), {
    ssr: false,
    loading: () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {[1, 2].map((i) => (
                <div key={i} className="p-4 rounded-2xl shadow-card bg-gray-50 animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-3"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="flex gap-2">
                            <div className="h-8 bg-gray-200 rounded flex-1"></div>
                            <div className="h-8 bg-gray-200 rounded flex-1"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
});

export function DriverPendingStatus() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cniDocument, setCniDocument] = useState<UploadedDocument | null>(null);
    const [licenseDocument, setLicenseDocument] = useState<UploadedDocument | null>(null);
    const [existingDocuments, setExistingDocuments] = useState<DocumentInfo[]>([]);
    const [activeTab, setActiveTab] = useState("documents");
    const { reloadCurrentUser, user } = useAuthStore();

    // Rebuild existing documents when user data changes
    useEffect(() => {
        if (user) {
            setExistingDocuments(buildExistingDocuments(user));
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!cniDocument && !licenseDocument) {
            toast({
                title: "No changes made",
                description: "Please upload at least one document to update your application",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Only upload documents that have been changed
            const cniBase64 = cniDocument?.base64;
            const licenseBase64 = licenseDocument?.base64;

            if (cniBase64 || licenseBase64) {
                const result = await updateDriverDocuments({ cniBase64, licenseBase64 });
                if (result.success) {
                    await reloadCurrentUser();
                    // Reset to first tab to show updated documents
                    setActiveTab("documents");
                    toast({
                        title: "Documents updated!",
                        description: "Your updated documents have been submitted for review.",
                        variant: "default",
                    });
                    setCniDocument(null);
                    setLicenseDocument(null);
                } else {
                    throw new Error(result.error || "Failed to update documents");
                }
            }
        } catch (error) {
            toast({
                title: "Update failed",
                description: error instanceof Error ? error.message : "Please try again later",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewDocument = (document: DocumentData) => {
        if (document.url) {
            window.open(document.url, "_blank");
        }
    };

    const handleDownloadDocument = (document: DocumentData) => {
        if (document.url) {
            const link = window.document.createElement("a");
            link.href = document.url;
            link.download = document.name;
            link.click();
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header Card */}
                    <Card className="p-8 rounded-2xl shadow-card text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Clock className="w-8 h-8 text-yellow-600" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold mb-4">Application Under Review</h1>
                        <p className="text-lg text-muted-foreground mb-6">
                            Your driver application is currently being reviewed by our team.
                        </p>
                        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg max-w-2xl mx-auto">
                            <p className="text-sm text-yellow-800">
                                Please wait while our administrators review your application.
                                You will receive a notification once your account is approved or if any additional information is needed.
                            </p>
                        </div>
                    </Card>

                    {/* Document Management Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 rounded-2xl">
                            <TabsTrigger value="documents" className="rounded-2xl">
                                <FileText className="w-4 h-4 mr-2" />
                                Your Documents
                            </TabsTrigger>
                            <TabsTrigger value="update" className="rounded-2xl">
                                <Upload className="w-4 h-4 mr-2" />
                                Update Documents
                            </TabsTrigger>
                        </TabsList>

                        {/* Documents Preview Tab */}
                        <TabsContent value="documents" className="space-y-6">
                            <Card className="p-6 rounded-2xl shadow-card">
                                <h2 className="text-xl font-semibold mb-4">Submitted Documents</h2>
                                {existingDocuments.length > 0 ? (
                                    <DocumentGrid
                                        documents={existingDocuments}
                                        onViewDocument={handleViewDocument}
                                        onDownloadDocument={handleDownloadDocument}
                                        columns={2}
                                    />
                                ) : (
                                    <div className="text-center py-12">
                                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-muted-foreground">No documents found. Please upload your documents in the Update tab.</p>
                                    </div>
                                )}
                            </Card>
                        </TabsContent>

                        {/* Update Documents Tab */}
                        <TabsContent value="update" className="space-y-6">
                            <Card className="p-8 rounded-2xl shadow-card">
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold mb-2">Update Application Documents</h2>
                                    <p className="text-muted-foreground">
                                        Upload new documents if you want to modify your application or if requested by our administrators.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Requirements Info */}
                                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                        <h3 className="font-medium text-blue-900 mb-2">Document Requirements</h3>
                                        <ul className="text-sm text-blue-800 space-y-1">
                                            <li>• Valid national ID card (CNI)</li>
                                            <li>• Valid driver's license</li>
                                            <li>• Documents must be clear and readable</li>
                                            <li>• Accepted formats: JPEG, PNG, PDF (max 5MB each)</li>
                                        </ul>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <DocumentUpload
                                            label="National ID Card (CNI)"
                                            id="cni-update"
                                            existingFile={null}
                                            existingPreview=""
                                            onFileChange={setCniDocument}
                                        />

                                        <DocumentUpload
                                            label="Driver's License"
                                            id="license-update"
                                            existingFile={null}
                                            existingPreview=""
                                            onFileChange={setLicenseDocument}
                                        />
                                    </div>

                                    <div className="pt-4 border-t">
                                        <Button
                                            type="submit"
                                            className="w-full h-12 text-lg rounded-2xl"
                                            disabled={isSubmitting || (cniDocument === null && licenseDocument === null)}
                                        >
                                            {isSubmitting ? "Updating..." : "Update Documents"}
                                        </Button>
                                        <p className="text-xs text-muted-foreground text-center mt-2">
                                            Only upload documents that have been changed or specifically requested by administrators.
                                        </p>
                                    </div>
                                </form>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Additional Information */}
                    <Card className="p-6 rounded-2xl shadow-card bg-gray-50">
                        <h3 className="font-semibold mb-3">What happens next?</h3>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                    1
                                </div>
                                <div>
                                    <p className="font-medium">Review Process</p>
                                    <p className="text-muted-foreground">Our team will review your updated documents</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                    2
                                </div>
                                <div>
                                    <p className="font-medium">Notification</p>
                                    <p className="text-muted-foreground">You'll receive an email notification with the results</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                    3
                                </div>
                                <div>
                                    <p className="font-medium">Approval</p>
                                    <p className="text-muted-foreground">Once approved, you can start accepting deliveries</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

