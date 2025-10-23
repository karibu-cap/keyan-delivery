"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/hooks/auth-store";
import { useToast } from "@/hooks/use-toast";
import { updateDriverDocuments } from "@/lib/actions/client/driver";
import { Clock, FileText, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import type { UploadedDocument } from "./DocumentUpload";
import { DocumentUpload } from "./DocumentUpload";
import DriverDocumentsPreview from "./profile/DriverDocumentsPreview";

export function DriverPendingStatus() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cniDocument, setCniDocument] = useState<UploadedDocument | null>(null);
    const [licenseDocument, setLicenseDocument] = useState<UploadedDocument | null>(null);
    // const [existingDocuments, setExistingDocuments] = useState<DocumentInfo[]>([]);
    const [activeTab, setActiveTab] = useState("documents");
    const { user } = useAuthStore();

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

    return (
        <div className="min-h-screen">
            {/* Hero Section with Red Gradient */}
            <section className="gradient-hero py-8 sm:py-12 lg:py-16 px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="text-white text-center">
                        {/* Animated Icon */}
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4 animate-pulse">
                            <Clock className="w-10 h-10 text-white animate-spin" style={{ animationDuration: '3s' }} />
                        </div>
                        {/* Header Title */}
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                            Application Under Review
                        </h1>
                        <p className="text-sm sm:text-base text-white/90">
                            Your driver application is currently being reviewed by our team
                        </p>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-18 max-w-4xl -mt-8">
                <div className="space-y-6">
                    {/* Document Management Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50 backdrop-blur-sm rounded-xl p-1">
                            <TabsTrigger
                                value="documents"
                                className="rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Your Documents</span>
                                {/* <span className="ml-2 px-2 py-0.5 rounded-full bg-background/20 text-xs font-semibold">
                                    {availableOrders.length}
                                </span> */}
                            </TabsTrigger>
                            <TabsTrigger
                                value="update"
                                className="rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Update Documents</span>
                                {/* <span className="ml-2 px-2 py-0.5 rounded-full bg-background/20 text-xs font-semibold">
                                    {inProgressOrders.length}
                                </span> */}
                            </TabsTrigger>
                        </TabsList>

                        {/* Documents Preview Tab */}
                        <TabsContent value="documents" className="space-y-6">
                            {user?.id && (
                                <DriverDocumentsPreview driverId={user?.id} />)}
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
                                            <li>• Accepted formats: JPEG, PNG, (max 1MB each)</li>
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

