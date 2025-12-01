// File: /components/driver/DriverReviewClient.tsx
// Unified driver review page with status-based display (PENDING, REJECTED, BANNED)

"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/hooks/use-auth-store";
import { DriverStatus } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, XCircle, AlertTriangle, FileText, CheckCircle, Mail, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateDriverDocuments } from "@/lib/actions/client/driver";
import AnimatedStatsCard from "./AnimatedStatsCard";
import DriverDocumentsPreview from "./profile/DriverDocumentsPreview";
import { DocumentUpload, UploadedDocument } from "./DocumentUpload";
import { useBlockBackNavigation } from "@/hooks/use-block-back-navigation";
import { useT } from "@/hooks/use-inline-translation";

export default function DriverReviewClient() {
    const { user, authUser, refreshSession } = useAuthStore();
    const { toast } = useToast();
    const t = useT();
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [activeTab, setActiveTab] = useState("preview");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cniDocument, setCniDocument] = useState<UploadedDocument | null>(null);
    const [licenseDocument, setLicenseDocument] = useState<UploadedDocument | null>(null);
    useBlockBackNavigation();

    useEffect(() => {
        const loadUser = async () => {
            setIsLoadingUser(true);
            await refreshSession();
            setIsLoadingUser(false);
        };
        loadUser();
    }, [refreshSession]);

    // Show skeleton while loading user data
    if (isLoadingUser) {
        return (
            <div className="min-h-screen">
                {/* Hero Skeleton */}
                <section className="gradient-hero py-8 sm:py-12 lg:py-16 px-4">
                    <div className="container mx-auto max-w-7xl">
                        <Skeleton className="h-8 w-48 bg-white/20 mx-auto" />
                        <Skeleton className="h-4 w-64 mt-2 bg-white/20 mx-auto" />
                    </div>
                </section>

                {/* Stats Cards Skeleton */}
                <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-6">
                    <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="p-3 animate-pulse">
                                <Skeleton className="h-3 w-20 mb-2" />
                                <Skeleton className="h-5 w-12" />
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Content Skeleton */}
                <div className="container mx-auto max-w-4xl px-4 pb-12">
                    <Card className="p-6 animate-pulse">
                        <Skeleton className="h-32 w-full" />
                    </Card>
                </div>
            </div>
        );
    }

    const status = user?.driverStatus;
    const isPending = status === DriverStatus.PENDING;
    const isRejected = status === DriverStatus.REJECTED;
    const isBanned = status === DriverStatus.BANNED;

    // Debug log to see current status
    console.log('Driver status:', status);
    console.log('isPending:', isPending, 'isRejected:', isRejected, 'isBanned:', isBanned);

    // Handle document update submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!cniDocument && !licenseDocument) {
            toast({
                title: t("No changes made"),
                description: t("Please upload at least one document to update your application"),
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await updateDriverDocuments({
                cniBase64: cniDocument?.base64 || null,
                licenseBase64: licenseDocument?.base64 || null,
            });

            if (result.success) {
                toast({
                    title: t("Documents updated!"),
                    description: t("Your application status has been updated to PENDING. Reloading page..."),
                    variant: "default",
                });

                // Wait a moment for the toast to be visible
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Reload the entire page because driver status changed from REJECTED to PENDING
                // This will show the PENDING interface instead of REJECTED
                window.location.reload();
            } else {
                throw new Error(result.error || t("Failed to update documents"));
            }
        } catch (error) {
            toast({
                title: t("Update failed"),
                description: error instanceof Error ? error.message : t("Please try again later"),
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Determine hero content based on status
    const getHeroContent = () => {
        if (isPending) {
            return {
                icon: Clock,
                iconAnimation: "animate-spin",
                iconAnimationDuration: "3s",
                title: t("Application Under Review"),
                description: t("Your driver application is currently being reviewed by our team"),
            };
        }
        if (isRejected) {
            return {
                icon: XCircle,
                iconAnimation: "animate-bounce",
                title: t("Application Rejected"),
                description: t("Your driver application has been rejected. Please review the information below."),
            };
        }
        if (isBanned) {
            return {
                icon: AlertTriangle,
                iconAnimation: "animate-bounce",
                title: t("Account Suspended"),
                description: t("Your driver account has been suspended by our administrators"),
            };
        }
        return {
            icon: Clock,
            iconAnimation: "",
            title: t("Application Status"),
            description: t("Check your driver application status"),
        };
    };

    const heroContent = getHeroContent();
    const HeroIcon = heroContent.icon;

    return (
        <div className="min-h-screen">
            {/* Hero Section with Red Gradient */}
            <section className="gradient-hero py-8 sm:py-12 lg:py-16 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-white text-center">
                        {/* Animated Icon */}
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                            <HeroIcon
                                className={`w-10 h-10 text-white ${heroContent.iconAnimation}`}
                                style={heroContent.iconAnimationDuration ? { animationDuration: heroContent.iconAnimationDuration } : {}}
                            />
                        </div>
                        {/* Header Title */}
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                            {heroContent.title}
                        </h1>
                        <p className="text-sm sm:text-base text-white/90">
                            {heroContent.description}
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Cards - 3 cards overlapping hero */}
            <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {isPending && (
                        <>
                            <AnimatedStatsCard
                                title={t("Application Status")}
                                value={t("Under Review")}
                                icon={Clock}
                                color="text-blue-600"
                                bgColor="bg-blue-50 dark:bg-blue-950/20"
                                borderColor="border-blue-200 dark:border-blue-800"
                                animationDelay={0}
                            />
                            <AnimatedStatsCard
                                title={t("Review Time")}
                                value={t("24-48h")}
                                icon={FileText}
                                color="text-purple-600"
                                bgColor="bg-purple-50 dark:bg-purple-950/20"
                                borderColor="border-purple-200 dark:border-purple-800"
                                animationDelay={100}
                            />
                            <AnimatedStatsCard
                                title={t("Documents")}
                                value={t("Submitted")}
                                icon={CheckCircle}
                                color="text-green-600"
                                bgColor="bg-green-50 dark:bg-green-950/20"
                                borderColor="border-green-200 dark:border-green-800"
                                animationDelay={200}
                            />
                        </>
                    )}

                    {isRejected && (
                        <>
                            <AnimatedStatsCard
                                title={t("Application Status")}
                                value={t("Rejected")}
                                icon={XCircle}
                                color="text-primary"
                                bgColor="bg-red-50 dark:bg-red-950/20"
                                borderColor="border-red-200 dark:border-red-800"
                                animationDelay={0}
                            />
                            <AnimatedStatsCard
                                title={t("Documents")}
                                value={t("View Only")}
                                icon={FileText}
                                color="text-orange-600"
                                bgColor="bg-orange-50 dark:bg-orange-950/20"
                                borderColor="border-orange-200 dark:border-orange-800"
                                animationDelay={100}
                            />
                            <AnimatedStatsCard
                                title={t("Contact Support")}
                                value={t("Available")}
                                icon={Mail}
                                color="text-blue-600"
                                bgColor="bg-blue-50 dark:bg-blue-950/20"
                                borderColor="border-blue-200 dark:border-blue-800"
                                animationDelay={200}
                            />
                        </>
                    )}

                    {isBanned && (
                        <>
                            <AnimatedStatsCard
                                title={t("Account Status")}
                                value={t("Suspended")}
                                icon={AlertTriangle}
                                color="text-primary"
                                bgColor="bg-red-50 dark:bg-red-950/20"
                                borderColor="border-red-200 dark:border-red-800"
                                animationDelay={0}
                            />
                            <AnimatedStatsCard
                                title={t("Access")}
                                value={t("Restricted")}
                                icon={XCircle}
                                color="text-orange-600"
                                bgColor="bg-orange-50 dark:bg-orange-950/20"
                                borderColor="border-orange-200 dark:border-orange-800"
                                animationDelay={100}
                            />
                            <AnimatedStatsCard
                                title={t("Contact Support")}
                                value={t("Required")}
                                icon={Mail}
                                color="text-blue-600"
                                bgColor="bg-blue-50 dark:bg-blue-950/20"
                                borderColor="border-blue-200 dark:border-blue-800"
                                animationDelay={200}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 pb-12 max-w-4xl">
                {isPending && (
                    <div className="space-y-6">
                        {/* Documents Preview */}
                        <DriverDocumentsPreview driverId={authUser?.id || ''} />

                        {/* Information Card */}
                        <Card className="p-6 rounded-2xl shadow-card bg-blue-50 dark:bg-blue-950/20">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-600" />
                                {t("What happens next?")}
                            </h3>
                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                        {t("1")}
                                    </div>
                                    <div>
                                        <p className="font-medium">{t("Review Process")}</p>
                                        <p className="text-muted-foreground">{t("Our team reviews your documents")}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                        {t("2")}
                                    </div>
                                    <div>
                                        <p className="font-medium">{t("Notification")}</p>
                                        <p className="text-muted-foreground">{t("You'll receive an email with results")}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                        {t("3")}
                                    </div>
                                    <div>
                                        <p className="font-medium">{t("Start Earning")}</p>
                                        <p className="text-muted-foreground">{t("Accept deliveries once approved")}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {isRejected && (
                    <div className="space-y-6">
                        {/* Rejection Notice */}
                        <Card className="p-6 rounded-2xl shadow-card border-2 border-red-200 dark:border-red-800">
                            <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-xl border border-red-200 dark:border-red-800">
                                <h2 className="font-semibold text-red-900 dark:text-red-100 mb-3">
                                    Application Rejected
                                </h2>
                                <p className="text-sm text-red-800 dark:text-red-200 mb-4">
                                    Unfortunately, your application to become a driver has not been approved at this time.
                                    This may be due to incomplete or unclear documentation.
                                </p>
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    You can update your documents below and resubmit for review.
                                </p>
                            </div>
                        </Card>

                        {/* Document Management Tabs */}
                        <Card className="p-6 rounded-2xl shadow-card">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid w-full grid-cols-2 mb-6">
                                    <TabsTrigger value="preview" className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Preview Documents
                                    </TabsTrigger>
                                    <TabsTrigger value="update" className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Update Documents
                                    </TabsTrigger>
                                </TabsList>

                                {/* Preview Tab */}
                                <TabsContent value="preview" className="space-y-4">
                                    <div>
                                        <h2 className="text-xl font-semibold mb-2">Your Current Documents</h2>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            These are the documents currently on file. Switch to "Update Documents" to upload new versions.
                                        </p>
                                    </div>
                                    <DriverDocumentsPreview driverId={authUser?.id || ''} />
                                </TabsContent>

                                {/* Update Tab */}
                                <TabsContent value="update">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-semibold mb-2">Update Your Documents</h2>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Upload new documents to replace the rejected ones. You can update one or both documents.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* CNI Upload */}
                                            <DocumentUpload
                                                label="ID Card (CNI)"
                                                id="cni-update"
                                                onFileChange={setCniDocument}
                                                disabled={isSubmitting}
                                            />

                                            {/* Driver License Upload */}
                                            <DocumentUpload
                                                label="Driver's License"
                                                id="license-update"
                                                onFileChange={setLicenseDocument}
                                                disabled={isSubmitting}
                                            />
                                        </div>

                                        <div className="pt-4 border-t">
                                            <Button
                                                type="submit"
                                                className="w-full h-12 text-lg rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                                                disabled={isSubmitting || (!cniDocument && !licenseDocument)}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                        Updating...
                                                    </>
                                                ) : (
                                                    "Update Documents"
                                                )}
                                            </Button>
                                            <p className="text-xs text-muted-foreground text-center mt-2">
                                                Only upload documents that need to be updated. Your application will be reviewed again.
                                            </p>
                                        </div>
                                    </form>
                                </TabsContent>
                            </Tabs>
                        </Card>

                        {/* Support Contact */}
                        <Card className="p-6 rounded-2xl shadow-card bg-gray-50 dark:bg-gray-900">
                            <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
                                <Mail className="w-4 h-4 text-primary" />
                                Need Help?
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Contact our support team at <span className="font-mono text-primary">support@pataupesi.com</span> for assistance.
                            </p>
                        </Card>
                    </div>
                )}

                {isBanned && (
                    <div className="space-y-6">
                        {/* Ban Notice */}
                        <Card className="p-6 rounded-2xl shadow-card border-2 border-red-200 dark:border-red-800">
                            <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-xl border border-red-200 dark:border-red-800">
                                <h2 className="font-semibold text-red-900 dark:text-red-100 mb-3">
                                    Account Suspended
                                </h2>
                                <p className="text-sm text-red-800 dark:text-red-200 mb-4">
                                    Your account has been suspended and you can no longer access driver features.
                                    This decision was made by our administrators.
                                </p>
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    Please contact our support team for more information about this decision.
                                </p>
                            </div>
                        </Card>

                        {/* Support Contact */}
                        <Card className="p-6 rounded-2xl shadow-card bg-gray-50 dark:bg-gray-900">
                            <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
                                <Mail className="w-4 h-4 text-primary" />
                                Contact Support
                            </h3>
                            <p className="text-xs text-muted-foreground mb-3">
                                For questions about your account suspension, please reach out to our support team:
                            </p>
                            <p className="text-sm font-mono text-primary">support@pataupesi.com</p>
                        </Card>
                    </div>
                )}

                {/* Fallback content if no status matches */}
                {!isPending && !isRejected && !isBanned && (
                    <div className="space-y-6">
                        <Card className="p-6 rounded-2xl shadow-card border-2 border-orange-200 dark:border-orange-800">
                            <div className="bg-orange-50 dark:bg-orange-950/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
                                <h2 className="font-semibold text-orange-900 dark:text-orange-100 mb-3">
                                    Application Status Unknown
                                </h2>
                                <p className="text-sm text-orange-800 dark:text-orange-200 mb-4">
                                    We couldn't determine your application status. Current status: <strong>{status || 'Not set'}</strong>
                                </p>
                                <p className="text-sm text-orange-700 dark:text-orange-300">
                                    Please contact our support team for assistance.
                                </p>
                            </div>
                        </Card>

                        {/* Support Contact */}
                        <Card className="p-6 rounded-2xl shadow-card bg-gray-50 dark:bg-gray-900">
                            <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
                                <Mail className="w-4 h-4 text-primary" />
                                Contact Support
                            </h3>
                            <p className="text-xs text-muted-foreground mb-3">
                                For questions about your application status, please contact:
                            </p>
                            <p className="text-sm font-mono text-primary">support@pataupesi.com</p>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
