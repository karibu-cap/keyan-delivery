import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { fetchMerchants, IMerchant } from "@/lib/actions/stores";
import { StoresContent } from "@/components/client/stores/StoresContent";
import { StoresLoading } from "@/components/client/stores/StoresLoading";
import { getLocale } from "next-intl/server";
import { getT } from "@/lib/server-translations";
import type { MerchantType } from "@prisma/client";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Your Stores | Keyan",
  description: "Shop from stores near you",
};

async function getStores(): Promise<IMerchant[]> {
  const locale = await getLocale();
  const t = await getT(locale);
  try {
    const response = await fetchMerchants({
      limit: 50,
      offset: 0,
    });
    return response.merchants;
  } catch (error) {
    console.error("Error fetching stores:", error);
    throw new Error(t("Failed to load stores"));
  }
}

export default async function StoresPage(  { searchParams }: { searchParams: Promise<{ merchantType: MerchantType }> }) {
  const stores = await getStores();
  const _searchParams = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Suspense fallback={<StoresLoading />}>
        <StoresContent initialStores={stores} initialMerchantTypeFilters={_searchParams.merchantType} />
      </Suspense>
    </div>
  );
}
