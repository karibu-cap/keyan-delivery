"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fileToBase64 } from "@/lib/utils/client/base_64";

export interface UploadedDocument {
    file: File;
    preview: string;
    base64?: string;
}

interface DocumentUploadProps {
    label: string;
    id: string;
    accept?: string;
    existingFile?: File | null;
    existingPreview?: string;
    onFileChange: (document: UploadedDocument | null) => void;
    disabled?: boolean;
}

export function DocumentUpload({
    label,
    id,
    accept = "image/jpeg,image/jpg,image/png",
    existingFile = null,
    existingPreview = "",
    onFileChange,
    disabled = false,
}: DocumentUploadProps) {
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(existingFile);
    const [preview, setPreview] = useState<string>(existingPreview);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validate file size (max 5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Please upload a file smaller than 5MB",
                variant: "destructive",
            });
            return;
        }

        // Validate file type
        const validTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!validTypes.includes(selectedFile.type)) {
            toast({
                title: "Invalid file type",
                description: "Please upload a JPEG, PNG file",
                variant: "destructive",
            });
            return;
        }

        try {
            let previewUrl = "";
                // Handle image files with regular FileReader
                previewUrl = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(selectedFile);
                });


            const base64 = await fileToBase64(selectedFile);

            setFile(selectedFile);
            setPreview(previewUrl);

            onFileChange({
                file: selectedFile,
                preview: previewUrl,
                base64,
            });
        } catch (error) {
            console.error("Error processing file:", error);
            toast({
                title: "Error processing file",
                description: "Please try again",
                variant: "destructive",
            });
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreview("");
        onFileChange(null);
    };

    return (
        <div className="space-y-2 sm:space-y-3">
            <Label htmlFor={id} className="text-sm sm:text-base font-semibold">
                {label} *
            </Label>
            <div
                className={`
                    relative border-2 border-dashed border-border rounded-2xl p-4 sm:p-6 lg:p-8
                    text-center hover:border-primary transition-colors cursor-pointer overflow-hidden h-48 sm:h-56 lg:h-60 w-full
                    ${preview ? "text-white" : ""}
                    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                `}
                style={
                    preview
                        ? {
                            backgroundImage: `url(${preview})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                        }
                        : {}
                }
            >
                {preview && (
                    <div className="absolute inset-0 bg-black/50"></div>
                )}

                <Input
                    id={id}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={disabled}
                />

                <label
                    htmlFor={id}
                    className={`relative z-10 cursor-pointer flex flex-col items-center gap-3 ${disabled ? "cursor-not-allowed" : ""}`}
                >
                    {file ? (
                        <>
                                <Camera className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-primary" />
                            <div className="space-y-1">
                                <p className="font-medium text-sm sm:text-base truncate max-w-full">{file.name}</p>
                                <p className="text-xs sm:text-sm opacity-80">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-black text-xs sm:text-sm mt-2"
                                onClick={(e) => {
                                    e.preventDefault();
                                    clearFile();
                                }}
                                disabled={disabled}
                            >
                                Change File
                            </Button>
                        </>
                    ) : (
                        <>
                            <Upload className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-muted-foreground" />
                            <div className="space-y-1">
                                <p className="font-medium text-foreground text-sm sm:text-base">
                                    Click to upload {label.toLowerCase()}
                                </p>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    JPEG, PNG (max 5MB)
                                </p>
                            </div>
                        </>
                    )}
                </label>
            </div>
        </div>
    );
}