import { StoresLoading } from "@/components/client/stores/StoresLoading";
import Navbar from "@/components/Navbar";

export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <StoresLoading />
        </div>
    );
}