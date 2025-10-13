"use client";

import dynamic from "next/dynamic";

// Dynamically import DocumentPreview to avoid SSR issues with react-pdf-viewer
const DocumentPreview = dynamic(() => import("./DocumentPreview").then(mod => ({ default: mod.DocumentPreview })), {
    ssr: false,
    loading: () => (
        <div className="p-4 rounded-2xl shadow-card bg-gray-50 animate-pulse">
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
    )
});

import type { DocumentData } from "./DocumentPreview";

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
                return "grid-cols-1 sm:grid-cols-2";
            case 3:
                return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
            case 4:
                return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
            default:
                return "grid-cols-1 sm:grid-cols-2";
        }
    };

    if (documents.length === 0) {
        return (
            <div className="text-center py-8 sm:py-12 px-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg
                        className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400"
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
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">
                    {title || "Documents"}
                </h3>
                <p className="text-sm sm:text-base text-gray-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {title && (
                <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                        {documents.length} document{documents.length !== 1 ? "s" : ""}
                    </p>
                </div>
            )}

            <div className={`grid ${getGridCols()} gap-4 sm:gap-6`}>
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