import { Suspense } from "react";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import { fetchStoreDataById, IMerchantDetail } from "@/lib/actions/stores";
import type { Metadata } from "next";
import { StoreDetailLoading } from "@/components/client/stores/StoreDetailLoading";
import { StoreDetailContent } from "@/components/client/stores/StoreDetailContent";

interface Aisle {
  id: string;
  name: string;
  count: number;
}

interface StoreData {
  merchant: IMerchantDetail;
  aisles: Aisle[];
}

async function getStoreData(id: string): Promise<StoreData | null> {
  try {
    const storeData = await fetchStoreDataById(id);

    return storeData;
  } catch (error) {
    console.error("Error fetching store data:", error);
    return null;
  }
}

export async function generateMetadata(
  props: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const storeData = await getStoreData(params.id);

  if (!storeData) {
    return {
      title: "Store Not Found",
    };
  }

  return {
    title: `${storeData.merchant.businessName} | Keyan`,
    description: `Shop from ${storeData.merchant.businessName}. ${storeData.merchant.products?.length || 0} products available.`,
  };
}

export default async function StoreDetailPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const storeData = await getStoreData(params.id);

  if (!storeData) {
    notFound();
  }

  const { merchant, aisles } = storeData;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Suspense fallback={<StoreDetailLoading />}>
        <StoreDetailContent
          initialStore={merchant}
          initialAisles={aisles}
        />
      </Suspense>
    </div>
  );
}
