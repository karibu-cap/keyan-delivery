import { StoreDetailContent } from "@/components/client/stores/StoreDetailContent";
import { StoreDetailLoading } from "@/components/client/stores/StoreDetailLoading";
import { fetchStoreDataBySlug, IMerchantDetail } from "@/lib/actions/server/stores";
import { generateLocalBusinessStructuredData, generateMerchantMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface Aisle {
  id: string;
  name: string;
  count: number;
}

interface StoreData {
  merchant: IMerchantDetail;
  aisles: Aisle[];
}

async function getStoreData(slug: string): Promise<StoreData | null> {
  try {
    const storeData = await fetchStoreDataBySlug(slug);

    return storeData;
  } catch (error) {
    console.error("Error fetching store data:", error);
    return null;
  }
}

export async function generateMetadata(
  props: { params: Promise<{ id: string; locale: string }> }
): Promise<Metadata> {
  const { id, locale } = await props.params;

  return generateMerchantMetadata(id, locale);
}

export default async function StoreDetailPage(
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  const storeData = await getStoreData(params.slug);

  if (!storeData) {
    notFound();
  }

  const { merchant, aisles } = storeData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Local Business Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateLocalBusinessStructuredData(merchant)),
        }}
      />
      <Suspense fallback={<StoreDetailLoading />}>
        <StoreDetailContent
          initialStore={merchant}
          initialAisles={aisles}
        />
      </Suspense>
    </div>
  );
}
