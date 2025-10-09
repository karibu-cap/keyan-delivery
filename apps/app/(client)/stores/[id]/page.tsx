"use server";

import Navbar from "@/components/Navbar";
import MerchantProductList from "@/components/client/stores/MerchantProductList";
import { IMerchant } from "@/lib/actions/stores";



interface Aisle {
  id: string;
  name: string;
  count: number;
}

async function fetchStoreData(id: string): Promise<{
  merchant: IMerchant;
  aisles: Aisle[];
} | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/merchants/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    if (!result.success) {
      return null;
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching store data:', error);
    return null;
  }
}

export default async function StoreDetail(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const storeData = await fetchStoreData(id);

  if (!storeData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Store not found</h1>
            <p className="text-muted-foreground">
              {"The store you're looking for doesn't exist or is unavailable."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { merchant, aisles } = storeData;

  return (
    <>
      <Navbar />
      <MerchantProductList
        initialStore={merchant}
        initialAisles={aisles}
      />
    </>
  );
}