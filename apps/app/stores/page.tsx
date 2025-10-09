"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import StoreCard from "@/components/stores/StoreCard";
import CategoryFilter from "@/components/stores/CategoryFilter";
import { fetchMerchants, fetchCategories, Category, filterStoresByCategory, searchStores, IMerchant } from "@/lib/actions/stores";


const Stores = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stores, setStores] = useState<IMerchant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [storesData, categoriesData] = await Promise.all([
          fetchMerchants(),
          fetchCategories()
        ]);
        setStores(storesData.merchants);
        setCategories(categoriesData.categories);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading stores data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadFilteredStores = async () => {
      try {
        let filteredStores: IMerchant[];

        if (searchQuery) {
          const response = await searchStores(searchQuery);
          filteredStores = response;
        } else if (selectedCategory && selectedCategory !== 'all') {
          const response = await filterStoresByCategory(selectedCategory);
          filteredStores = response;
        } else {
          const response = await fetchMerchants();
          filteredStores = response.merchants;
        }
        setStores(filteredStores);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to filter stores');
        console.error('Error filtering stores:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      loadFilteredStores();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCategory]);


  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading stores...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-destructive mb-2">Error loading stores</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="gradient-hero py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-4xl font-bold text-white mb-6">Discover Local Stores</h1>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-2 shadow-lg max-w-3xl">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search stores, products, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-0 focus-visible:ring-0 text-base"
                />
              </div>
              <Button variant="outline" className="px-4">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Stores Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-1">Available Stores</h2>
              <p className="text-muted-foreground">
                {stores.length} stores near you
              </p>
            </div>

            <Button variant="outline" className="rounded-2xl">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {stores.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No stores found</p>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store, index) => (
                <StoreCard key={store.id} store={store} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Stores;