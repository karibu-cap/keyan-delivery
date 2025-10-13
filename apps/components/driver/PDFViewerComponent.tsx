"use client";

// Import styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";

interface PDFViewerComponentProps {
    url: string;
}

export default function PDFViewerComponent(props: PDFViewerComponentProps) {
    const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(props.url)}&embedded=true`;
;

    return (
        <iframe
            src={viewerUrl}
            style={{ width: "100%", height: "80vh", border: "none" }}
            title="PDF Viewer"
        />
    );
}

