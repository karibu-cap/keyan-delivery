/**
 * Utility functions for handling driver documents
 */

export interface UserDocumentData {
    _id?: { $oid: string };
    authId?: string;
    email?: string;
    fullName?: string | null;
    phone?: string | null;
    roles?: string[];
    cni?: string | null;
    driverDocument?: string | null;
    driverStatus?: string;
    updatedAt?: { $date?: { $numberLong: string } } | string | number | Date | null;
}

export interface DocumentInfo {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: Date;
    status: "approved" | "rejected" | "pending";
}

/**
 * Determines document type based on URL or filename
 */
export function getDocumentTypeFromUrl(url: string): "image" | "pdf" | "unknown" {
    const filename = url.split('/').pop()?.toLowerCase() || '';

    if (filename.includes('.pdf')) {
        return "pdf";
    } else if (filename.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        return "image";
    }

    return "unknown";
}

/**
 * Gets document display name based on URL or document type
 */
export function getDocumentDisplayName(url: string, documentType?: string): string {
    const filename = url.split('/').pop() || '';

    // If it's a CNI document (based on common naming patterns)
    if (filename.toLowerCase().includes('cni') || filename.toLowerCase().includes('id')) {
        return "National ID Card (CNI)";
    }

    // If it's a driver's license (based on common naming patterns)
    if (filename.toLowerCase().includes('license') || filename.toLowerCase().includes('permit')) {
        return "Driver's License";
    }

    // If it's a driver document (from the driverDocument field)
    if (documentType === 'driverDocument') {
        return "Driver's License";
    }

    // Default fallback
    if (getDocumentTypeFromUrl(url) === 'pdf') {
        return "PDF Document";
    }

    return "Document";
}

/**
 * Creates DocumentInfo object from URL and metadata
 */
export function createDocumentInfo(
    id: string,
    url: string,
    uploadedAt: Date,
    status: "approved" | "rejected" | "pending" = "pending"
): DocumentInfo {
    return {
        id,
        name: getDocumentDisplayName(url, id.includes('driverDocument') ? 'driverDocument' : id),
        type: getDocumentTypeFromUrl(url) === 'pdf' ? 'application/pdf' : 'image/jpeg',
        url,
        uploadedAt,
        status,
    };
}

/**
 * Builds existing documents array from user data
 */
export function buildExistingDocuments(user: UserDocumentData): DocumentInfo[] {
    const documents: DocumentInfo[] = [];

    // Handle CNI document
    if (user.cni) {
        documents.push(createDocumentInfo(
            "cni",
            user.cni,
            parseDocumentDate(user.updatedAt),
            "pending"
        ));
    }

    // Handle driver's license document
    if (user.driverDocument) {
        documents.push(createDocumentInfo(
            "driverDocument",
            user.driverDocument,
            parseDocumentDate(user.updatedAt),
            "pending"
        ));
    }

    return documents;
}

/**
 * Validates if URL is a valid document URL
 */
export function isValidDocumentUrl(url: string): boolean {
    return url.startsWith('http') && (url.includes('cloudinary') || url.includes('upload'));
}

/**
 * Parses various date formats from user data
 */
export function parseDocumentDate(dateValue: { $date?: { $numberLong: string } } | string | number | Date | null | undefined): Date {
    if (!dateValue) return new Date();

    if (dateValue instanceof Date) return dateValue;

    if (typeof dateValue === 'number') return new Date(dateValue);

    if (typeof dateValue === 'string') {
        // Handle ISO string or regular date string
        return new Date(dateValue);
    }

    if (typeof dateValue === 'object' && dateValue.$date && dateValue.$date.$numberLong) {
        return new Date(parseInt(dateValue.$date.$numberLong));
    }

    return new Date();
}

/**
 * Gets MIME type from file extension
 */
export function getMimeTypeFromExtension(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();

    switch (ext) {
        case 'pdf':
            return 'application/pdf';
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'gif':
            return 'image/gif';
        case 'webp':
            return 'image/webp';
        default:
            return 'application/octet-stream';
    }
}