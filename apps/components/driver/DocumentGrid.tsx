"use client";

import { DocumentPreview, DocumentData } from "./DocumentPreview";

interface DocumentGridProps {
    documents: DocumentData[];
    onViewDocument?: (document: DocumentData) => void;
    onDownloadDocument?: (document: DocumentData) => void;
    showActions?: boolean;
    columns?: 1 | 2 | 3 | 4;
    title?: string;
    emptyMessage?: string;
}

export type { DocumentData };

export function DocumentGrid({
    documents,
    onViewDocument,
    onDownloadDocument,
    showActions = true,
    columns = 2,
    title,
    emptyMessage = "No documents uploaded yet",
}: DocumentGridProps) {
    const getGridCols = () => {
        switch (columns) {
            case 1:
                return "grid-cols-1";
            case 2:
                return "grid-cols-1 lg:grid-cols-2";
            case 3:
                return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
            case 4:
                return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
            default:
                return "grid-cols-1 lg:grid-cols-2";
        }
    };

    if (documents.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {title || "Documents"}
                </h3>
                <p className="text-gray-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {title && (
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {documents.length} document{documents.length !== 1 ? "s" : ""}
                    </p>
                </div>
            )}

            <div className={`grid ${getGridCols()} gap-6`}>
                {documents.map((document) => (
                    <DocumentPreview
                        key={document.id}
                        document={document}
                        onView={onViewDocument}
                        onDownload={onDownloadDocument}
                        showActions={showActions}
                    />
                ))}
            </div>
        </div>
    );
}