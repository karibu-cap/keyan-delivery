import { StoresContent } from "@/components/client/stores/StoresContent";
import { StoresLoading } from "@/components/client/stores/StoresLoading";
import { getServerT } from "@/i18n/server-translations";
import { fetchMerchants } from "@/lib/actions/server/stores";
import type { IMerchant } from "@/types/generic_types";
import type { MerchantType } from "@prisma/client";

import { Suspense } from "react";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Your Stores | Pataupesi",
  description: "Shop from stores near you",
};

async function getStores(): Promise<IMerchant[]> {

  const t = await getServerT();
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

export default async function StoresPage({ searchParams }: { searchParams: Promise<{ merchantType: MerchantType }> }) {
  const stores = await getStores();
  const _searchParams = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<StoresLoading />}>
        <StoresContent
          stores={stores}
          selectedMerchantType={_searchParams.merchantType || "all"}
        />
      </Suspense>
    </div>
  );
}
