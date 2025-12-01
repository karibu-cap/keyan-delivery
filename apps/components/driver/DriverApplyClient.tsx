// File: /components/driver/DriverApplyClient.tsx
// Driver application form with hero, stats cards, and document upload

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Truck, FileText, Clock, Users, TrendingUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/hooks/use-auth-store";
import { uploadDriverDocuments } from "@/lib/actions/client/driver";
import { ROUTES } from "@/lib/router";
import { DocumentUpload, UploadedDocument } from "./DocumentUpload";
import AnimatedStatsCard from "./AnimatedStatsCard";
import { useApplyStats } from "@/hooks/use-apply-stats";
import { useBlockBackNavigation } from "@/hooks/use-block-back-navigation";
import { useT } from "@/hooks/use-inline-translation";

export default function DriverApplyClient() {
    const router = useRouter();
    const { toast } = useToast();
    const t = useT();
    const { refreshSession } = useAuthStore();
    const { stats, loading: statsLoading } = useApplyStats();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cniDocument, setCniDocument] = useState<UploadedDocument | null>(null);
    const [licenseDocument, setLicenseDocument] = useState<UploadedDocument | null>(null);
    useBlockBackNavigation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!cniDocument || !licenseDocument) {
            toast({
                title: t("Missing documents"),
                description: t("Please upload both your ID card and driver's license"),
                variant: "destructive",
            });
            return;
        }

        if (!cniDocument.base64 || !licenseDocument.base64) {
            toast({
                title: t("Error processing documents"),
                description: t("Please re-upload your documents"),
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await uploadDriverDocuments(cniDocument.base64, licenseDocument.base64);

            if (result.success) {
                await refreshSession();

                toast({
                    title: t("Application submitted!"),
                    description: t("Your driver application is under review. We'll notify you once it's approved."),
                    variant: "default",
                });
                router.push(ROUTES.driverReview);
            } else {
                throw new Error(result.error || t("Failed to submit application"));
            }
        } catch (error) {
            toast({
                title: t("Submission failed"),
                description: error instanceof Error ? error.message : t("Please try again later"),
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
                <div className="container mx-auto max-w-7xl">
                    <div className="text-white">
                        {/* Header with animated icon */}
                        <div className="flex items-start gap-4 mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full animate-pulse flex-shrink-0">
                                <Truck className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                                    {t("Become a Pataupesi Driver")}
                                </h1>
                                <p className="text-sm sm:text-base text-white/90">
                                    {t("Complete your application to start earning with flexible delivery opportunities")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Cards - 4 cards overlapping hero */}
            <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {statsLoading ? (
                        // Skeleton loading for stats cards
                        <>
                            {[0, 100, 200, 300].map((delay) => (
                                <Card key={delay} className="p-3 animate-pulse">
                                    <Skeleton className="h-3 w-20 mb-2" />
                                    <Skeleton className="h-5 w-12" />
                                </Card>
                            ))}
                        </>
                    ) : (
                        <>
                            {/* Required Documents */}
                            <AnimatedStatsCard
                                title={t("Required Documents")}
                                value={stats?.requiredDocuments.toString() || "2"}
                                icon={FileText}
                                color="text-blue-600"
                                bgColor="bg-blue-50 dark:bg-blue-950/20"
                                borderColor="border-blue-200 dark:border-blue-800"
                                animationDelay={0}
                            />

                            {/* Review Time */}
                            <AnimatedStatsCard
                                title={t("Review Time")}
                                value={stats?.avgReviewTimeHours ? `${stats.avgReviewTimeHours}h` : "24-48h"}
                                icon={Clock}
                                color="text-purple-600"
                                bgColor="bg-purple-50 dark:bg-purple-950/20"
                                borderColor="border-purple-200 dark:border-purple-800"
                                animationDelay={100}
                            />

                            {/* Active Drivers */}
                            <AnimatedStatsCard
                                title={t("Active Drivers")}
                                value={stats?.activeDriversCount ? `${stats.activeDriversCount.toLocaleString()}+` : "1,250+"}
                                icon={Users}
                                color="text-green-600"
                                bgColor="bg-green-50 dark:bg-green-950/20"
                                borderColor="border-green-200 dark:border-green-800"
                                animationDelay={200}
                            />

                            {/* Drivers in Review */}
                            <AnimatedStatsCard
                                title={t("In Review")}
                                value={stats?.driversInReviewCount?.toString() || "48"}
                                icon={TrendingUp}
                                color="text-orange-600"
                                bgColor="bg-orange-50 dark:bg-orange-950/20"
                                borderColor="border-orange-200 dark:border-orange-800"
                                animationDelay={300}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Application Form */}
            <div className="container mx-auto max-w-4xl px-4 pb-12">
                <Card className="p-6 sm:p-8 rounded-2xl shadow-card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Header */}
                        <div className="space-y-2">
                            <h2 className="text-xl sm:text-2xl font-bold">{t("Upload Your Documents")}</h2>
                            <p className="text-sm text-muted-foreground">
                                {t("Please upload clear photos of your ID card and driver's license. Make sure all information is visible and readable.")}
                            </p>
                        </div>

                        {/* Document Uploads */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* CNI Upload */}
                            <DocumentUpload
                                label={t("ID Card (CNI)")}
                                id="cni-upload"
                                onFileChange={setCniDocument}
                                disabled={isSubmitting}
                            />

                            {/* Driver License Upload */}
                            <DocumentUpload
                                label={t("Driver's License")}
                                id="license-upload"
                                onFileChange={setLicenseDocument}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full h-12 text-lg rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                                disabled={isSubmitting || !cniDocument || !licenseDocument}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        {t("Submitting...")}
                                    </>
                                ) : (
                                    t("Submit Application")
                                )}
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Information Section */}
                <div className="mt-8 p-6 bg-accent/30 rounded-2xl">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        {t("What happens next?")}
                    </h3>
                    <ol className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs">
                                1
                            </span>
                            <span>{t("Your application will be reviewed by our team within 24-48 hours")}</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs">
                                2
                            </span>
                            <span>{t("You'll receive a notification once your application is approved")}</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs">
                                3
                            </span>
                            <span>{t("Start accepting deliveries and earning money immediately after approval")}</span>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
