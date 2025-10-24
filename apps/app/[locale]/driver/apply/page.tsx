"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { uploadDriverDocuments } from "@/lib/actions/client/driver";
import { ROUTES } from "@/lib/router";
import { fileToBase64 } from "@/lib/utils/client/base_64";
import { ArrowLeft, Camera, CheckCircle, FileText, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DriverApplicationPage() {
   const router = useRouter();
   const { toast } = useToast();
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [cniFile, setCniFile] = useState<File | null>(null);
   const [licenseFile, setLicenseFile] = useState<File | null>(null);


   const [licensePreview, setLicensePreview] = useState<string>("");
   const [cniPreview, setCniPreview] = useState<string>("");

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
         const validTypes = ["image/jpeg", "image/jpg", "image/png"];
         if (!validTypes.includes(file.type)) {
            toast({
               title: "Invalid file type",
               description: "Please upload a JPEG, PNG file",
               variant: "destructive",
            });
            return;
         }
         // Handle image files with regular FileReader
         const reader = new FileReader();
         reader.onloadend = () => {
            if (type === "cni") {
               setCniFile(file);
               setCniPreview(reader.result as string);
            } else {
               setLicenseFile(file);
               setLicensePreview(reader.result as string);
            }
         };
         reader.readAsDataURL(file);

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

      const cniBase64 = await fileToBase64(cniFile);
      const licenseBase64 = await fileToBase64(licenseFile);

      try {
         const result = await uploadDriverDocuments(cniBase64, licenseBase64);

         if (result.success) {
            router.refresh()

            toast({
               title: "Application submitted!",
               description: "Your driver application is under review. We'll notify you once it's approved.",
               variant: "default",
            });
            router.push(ROUTES.driverPending);
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

         <div className="container mx-auto max-w-4xl px-4 py-8">
            <Link
               href="/"
               className="inline-flex items-center text-foreground mb-6 hover:text-primary transition-colors"
            >
               <ArrowLeft className="w-4 h-4 mr-2" />
               Back to Dashboard
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
                           <span>Accepted formats: JPEG, PNG (max 1MB each)</span>
                        </li>
                     </ul>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">

                     {/* CNI Upload */}
                     <div className="space-y-3">
                        <Label htmlFor="cni" className="text-base font-semibold">
                           National ID Card (CNI) *
                        </Label>
                        <div
                           className={`
      relative border-2 border-dashed border-border rounded-2xl p-8 
      text-center hover:border-primary transition-colors cursor-pointer overflow-hidden h-60 w-full
      ${cniPreview ? "text-white" : ""}
    `}
                           style={
                              cniPreview
                                 ? {
                                    backgroundImage: `url(${cniPreview})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    backgroundRepeat: "no-repeat",
                                 }
                                 : {}
                           }
                        >
                           {cniPreview && (
                              <div className="absolute inset-0 bg-black/50"></div>
                           )}

                           <Input
                              id="cni"
                              type="file"
                              accept="image/jpeg,image/jpg,image/png"
                              onChange={(e) => handleFileChange(e, "cni")}
                              className="hidden"
                           />

                           <label
                              htmlFor="cni"
                              className="relative z-10 cursor-pointer flex flex-col items-center gap-3"
                           >
                              {cniFile ? (
                                 <>

                                    <Camera className="w-12 h-12 text-primary" />

                                    <div>
                                       <p className="font-medium">{cniFile.name}</p>
                                       <p className="text-sm opacity-80">
                                          {(cniFile.size / 1024 / 1024).toFixed(2)} MB
                                       </p>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" className="text-black" onClick={() => setCniPreview("")}>
                                       Change File
                                    </Button>
                                 </>
                              ) : (
                                 <>
                                    <Upload className="w-12 h-12 text-muted-foreground" />
                                    <div>
                                       <p className="font-medium text-foreground">
                                          Click to upload CNI
                                       </p>
                                       <p className="text-sm text-muted-foreground">
                                          JPEG, PNG (max 5MB)
                                       </p>
                                    </div>
                                 </>
                              )}
                           </label>
                        </div>
                     </div>

                     {/* License Upload */}
                     <div className="space-y-3">
                        <Label htmlFor="license" className="text-base font-semibold">
                           Driver&apos;s License *
                        </Label>
                        <div
                           className={`
      relative border-2 border-dashed border-border rounded-2xl p-8 
      text-center hover:border-primary transition-colors cursor-pointer overflow-hidden h-60 w-full
      ${licensePreview ? "text-white" : ""}
    `}
                           style={
                              licensePreview
                                 ? {
                                    backgroundImage: `url(${licensePreview})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    backgroundRepeat: "no-repeat",
                                 }
                                 : {}
                           }
                        >
                           {licensePreview && (
                              <div className="absolute inset-0 bg-black/50"></div>
                           )}

                           <Input
                              id="license"
                              type="file"
                              accept="image/jpeg,image/jpg,image/png"
                              onChange={(e) => handleFileChange(e, "license")}
                              className="hidden"
                           />

                           <label
                              htmlFor="license"
                              className="relative z-10 cursor-pointer flex flex-col items-center gap-3"
                           >
                              {licenseFile ? (
                                 <>
                                    <Camera className="w-12 h-12 text-primary" />

                                    <div>
                                       <p className="font-medium">{licenseFile.name}</p>
                                       <p className="text-sm opacity-80">
                                          {(licenseFile.size / 1024 / 1024).toFixed(2)} MB
                                       </p>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" className="text-black" onClick={() => setLicensePreview("")}>
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
                                          JPEG, PNG (max 1MB)
                                       </p>
                                    </div>
                                 </>
                              )}
                           </label>
                        </div>
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