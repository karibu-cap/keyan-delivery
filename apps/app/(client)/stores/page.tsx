import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { fetchMerchants, IMerchant } from "@/lib/actions/stores";
import { StoresContent } from "@/components/client/stores/StoresContent";
import { StoresLoading } from "@/components/client/stores/StoresLoading";

export const metadata = {
  title: "Your Stores | Keyan",
  description: "Shop from stores near you",
};

async function getStores(): Promise<IMerchant[]> {
  try {
    const response = await fetchMerchants({
      limit: 50,
      offset: 0,
    });
    return response.merchants;
  } catch (error) {
    console.error("Error fetching stores:", error);
    throw new Error("Failed to load stores");
  }
}

export default async function StoresPage() {
  const stores = await getStores();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Suspense fallback={<StoresLoading />}>
        <StoresContent initialStores={stores} />
      </Suspense>
    </div>
  );
}
