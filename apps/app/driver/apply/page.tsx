"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, FileText, CheckCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { uploadDriverDocuments } from "@/lib/actions/driver";

export default function DriverApplicationPage() {
   const router = useRouter();
   const { toast } = useToast();
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [cniFile, setCniFile] = useState<File | null>(null);
   const [licenseFile, setLicenseFile] = useState<File | null>(null);

   const handleFileChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      type: "cni" | "license"
   ) => {
      const file = e.target.files?.[0];
      if (file) {
         // Validate file size (max 5MB)
         if (file.size > 5 * 1024 * 1024) {
            toast({
               title: "File too large",
               description: "Please upload a file smaller than 5MB",
               variant: "destructive",
            });
            return;
         }

         // Validate file type
         const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
         if (!validTypes.includes(file.type)) {
            toast({
               title: "Invalid file type",
               description: "Please upload a JPEG, PNG, or PDF file",
               variant: "destructive",
            });
            return;
         }

         if (type === "cni") {
            setCniFile(file);
         } else {
            setLicenseFile(file);
         }
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!cniFile || !licenseFile) {
         toast({
            title: "Missing documents",
            description: "Please upload both your ID card and driver's license",
            variant: "destructive",
         });
         return;
      }

      setIsSubmitting(true);

      try {
         const result = await uploadDriverDocuments(cniFile, licenseFile);

         if (result.success) {
            toast({
               title: "Application submitted!",
               description: "Your driver application is under review. We'll notify you once it's approved.",
               variant: "default",
            });
            router.push("/profile");
         } else {
            throw new Error(result.error || "Failed to submit application");
         }
      } catch (error) {
         toast({
            title: "Submission failed",
            description: error instanceof Error ? error.message : "Please try again later",
            variant: "destructive",
         });
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="min-h-screen bg-background">
         <Navbar />

         <div className="container mx-auto max-w-4xl px-4 py-8">
            <Link
               href="/profile"
               className="inline-flex items-center text-foreground mb-6 hover:text-primary transition-colors"
            >
               <ArrowLeft className="w-4 h-4 mr-2" />
               Back to Profile
            </Link>

            <div className="mb-8">
               <h1 className="text-4xl font-bold mb-2">Become a Driver</h1>
               <p className="text-muted-foreground">
                  Submit your documents to start earning as a delivery driver
               </p>
            </div>

            <Card className="p-8 rounded-2xl shadow-card">
               <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Requirements Section */}
                  <div className="bg-accent/50 p-6 rounded-2xl mb-6">
                     <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        Requirements
                     </h2>
                     <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                           <span className="text-primary mt-1">•</span>
                           <span>Valid national ID card (CNI)</span>
                        </li>
                        <li className="flex items-start gap-2">
                           <span className="text-primary mt-1">•</span>
                           <span>Valid driver&apos;s license</span>
                        </li>
                        <li className="flex items-start gap-2">
                           <span className="text-primary mt-1">•</span>
                           <span>Documents must be clear and readable</span>
                        </li>
                        <li className="flex items-start gap-2">
                           <span className="text-primary mt-1">•</span>
                           <span>Accepted formats: JPEG, PNG, PDF (max 5MB each)</span>
                        </li>
                     </ul>
                  </div>

                  {/* CNI Upload */}
                  <div className="space-y-3">
                     <Label htmlFor="cni" className="text-base font-semibold">
                        National ID Card (CNI) *
                     </Label>
                     <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
                        <Input
                           id="cni"
                           type="file"
                           accept="image/jpeg,image/jpg,image/png,application/pdf"
                           onChange={(e) => handleFileChange(e, "cni")}
                           className="hidden"
                        />
                        <label
                           htmlFor="cni"
                           className="cursor-pointer flex flex-col items-center gap-3"
                        >
                           {cniFile ? (
                              <>
                                 <FileText className="w-12 h-12 text-primary" />
                                 <div>
                                    <p className="font-medium text-foreground">{cniFile.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                       {(cniFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                 </div>
                                 <Button type="button" variant="outline" size="sm">
                                    Change File
                                 </Button>
                              </>
                           ) : (
                              <>
                                 <Upload className="w-12 h-12 text-muted-foreground" />
                                 <div>
                                    <p className="font-medium text-foreground">Click to upload CNI</p>
                                    <p className="text-sm text-muted-foreground">
                                       JPEG, PNG or PDF (max 5MB)
                                    </p>
                                 </div>
                              </>
                           )}
                        </label>
                     </div>
                  </div>

                  {/* Driver License Upload */}
                  <div className="space-y-3">
                     <Label htmlFor="license" className="text-base font-semibold">
                        Driver&apos;s License *
                     </Label>
                     <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
                        <Input
                           id="license"
                           type="file"
                           accept="image/jpeg,image/jpg,image/png,application/pdf"
                           onChange={(e) => handleFileChange(e, "license")}
                           className="hidden"
                        />
                        <label
                           htmlFor="license"
                           className="cursor-pointer flex flex-col items-center gap-3"
                        >
                           {licenseFile ? (
                              <>
                                 <FileText className="w-12 h-12 text-primary" />
                                 <div>
                                    <p className="font-medium text-foreground">{licenseFile.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                       {(licenseFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                 </div>
                                 <Button type="button" variant="outline" size="sm">
                                    Change File
                                 </Button>
                              </>
                           ) : (
                              <>
                                 <Upload className="w-12 h-12 text-muted-foreground" />
                                 <div>
                                    <p className="font-medium text-foreground">
                                       Click to upload Driver&apos;s License
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                       JPEG, PNG or PDF (max 5MB)
                                    </p>
                                 </div>
                              </>
                           )}
                        </label>
                     </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                     <Button
                        type="submit"
                        className="w-full h-12 text-lg rounded-2xl"
                        disabled={isSubmitting || !cniFile || !licenseFile}
                     >
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                     </Button>
                  </div>
               </form>
            </Card>

            {/* Information Section */}
            <div className="mt-8 p-6 bg-accent/30 rounded-2xl">
               <h3 className="font-semibold mb-2">What happens next?</h3>
               <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                     <span className="font-semibold text-foreground">1.</span>
                     <span>Your application will be reviewed by our team</span>
                  </li>
                  <li className="flex items-start gap-2">
                     <span className="font-semibold text-foreground">2.</span>
                     <span>You&apos;ll receive a notification once approved</span>
                  </li>
                  <li className="flex items-start gap-2">
                     <span className="font-semibold text-foreground">3.</span>
                     <span>Start accepting deliveries and earning immediately</span>
                  </li>
               </ol>
            </div>
         </div>
      </div>
   );
}