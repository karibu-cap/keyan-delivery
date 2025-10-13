"use client";

import { useState } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import { FileText } from "lucide-react";

// Import styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";

interface PDFViewerComponentProps {
    url: string;
}

export function PDFViewerComponent({ url }: PDFViewerComponentProps) {
    // Create the zoom plugin
    const zoomPluginInstance = zoomPlugin();

    // Create the default layout plugin with sidebar
    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        sidebarTabs: (defaultTabs) => [
            defaultTabs[0], // Thumbnails tab
        ],
    });

    return (
        <div className="w-full h-full">
            <Worker workerUrl={`//unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.js`}>
                <Viewer
                    fileUrl={url}
                    plugins={[
                        defaultLayoutPluginInstance,
                        zoomPluginInstance,
                    ]}
                    theme="auto"
                />
            </Worker>
        </div>
    );
}
