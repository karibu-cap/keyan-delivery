import Navbar from "@/components/Navbar";
import MerchantProductList from "@/components/client/stores/MerchantProductList";
import { fetchStoreDataById, IMerchant } from "@/lib/actions/stores";


export default async function StoreDetail(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const storeData = await fetchStoreDataById(id);

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
        initialStore={merchant as unknown as IMerchant}
        initialAisles={aisles}
      />
    </>
  );
}