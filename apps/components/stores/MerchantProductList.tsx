"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Star,
    Search,
    ShoppingCart,
    ArrowLeft,
    Shield,
    ChevronRight,
    Menu,
    X
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import Image from "next/image";
import { IMerchant } from "@/lib/actions/stores";
import { MerchantProduct } from "./MerchantProduct";
import { AnimatePresence, motion } from "framer-motion";

interface Aisle {
    id: string;
    name: string;
    count: number;
}

interface StoreDetailClientProps {
    initialStore: IMerchant;
    initialAisles: Aisle[];
}

const CategorySidebar = ({ aisles, selectedCategory, onCategorySelect }: {
    aisles: Aisle[];
    selectedCategory: string;
    onCategorySelect: (category: string) => void;
}) => {


    return (
        <div className="w-60 bg-white border-r border-gray-200 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto flex-1">
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Browse aisles</h3>
                <div className="space-y-1">
                    {aisles.map((category) => (
                        <button
                            key={category.name}
                            onClick={() => onCategorySelect(category.name)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedCategory === category.name
                                ? "bg-gray-900 text-white"
                                : "text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

            </div>
        </div>
    );
};


const MobileCategoryDrawer = ({
    aisles,
    selectedCategory,
    onCategorySelect,
    isOpen,
    onClose
}: {
    aisles: Aisle[];
    selectedCategory: string;
    onCategorySelect: (category: string) => void;
    isOpen: boolean;
    onClose: () => void;
}) => {

    const preferences = [
        "Organic", "Gluten-free", "Cat", "Dog", "Baby"
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
            <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl transform translate-x-0">
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Browse aisles</h3>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-1">
                            {aisles.map((aisle) => (
                                <button
                                    key={aisle.name}
                                    onClick={() => {
                                        onCategorySelect(aisle.name);
                                        onClose();
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedCategory === aisle.name
                                        ? "bg-gray-900 text-white"
                                        : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    {aisle.name}
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-4">Shop by preference</h3>
                            <div className="space-y-2">
                                {preferences.map((pref) => (
                                    <button
                                        key={pref}
                                        className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        {pref}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MerchantProductList = ({ initialStore, initialAisles }: StoreDetailClientProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { cartItems } = useCart();

    const { products } = initialStore;

    const filteredProducts = products?.filter((product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (!selectedCategory || product.categories?.some(cat =>
            cat.category.name.toLowerCase().includes(selectedCategory.toLowerCase())
        ))
    );

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 lg:hidden">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Link href="/stores">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div className="flex items-center space-x-2">
                                <Image
                                    src={initialStore.logoUrl || '/placeholder.svg'}
                                    alt={initialStore.businessName}
                                    width={32}
                                    height={32}
                                    className="rounded-lg"
                                />
                                <div>
                                    <h1 className="text-lg font-semibold text-gray-900 truncate">{initialStore.businessName}</h1>
                                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                                        <div className="flex items-center space-x-1">
                                            <Star className="w-3 h-3 fill-current text-yellow-400" />
                                            <span>{initialStore.rating?.toFixed(1) || '4.5'}</span>
                                        </div>
                                        <span>•</span>
                                        <span className="truncate">{initialStore.deliveryTime || 'By 10:30am'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                                <Menu className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative"
                                onClick={() => setIsCartOpen(true)}
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {totalItems > 0 && (
                                    <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-primary text-white text-xs rounded-full">
                                        {totalItems}
                                    </Badge>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border-b border-gray-200 hidden lg:block">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/stores">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div className="flex items-center space-x-3">
                                <Image
                                    src={initialStore.logoUrl || '/placeholder.svg'}
                                    alt={initialStore.businessName}
                                    width={48}
                                    height={48}
                                    className="rounded-lg"
                                />
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900">{initialStore.businessName}</h1>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <div className="flex items-center space-x-1">
                                            <Star className="w-4 h-4 fill-current text-yellow-400" />
                                            <span>{initialStore.rating?.toFixed(1) || '4.5'}</span>
                                        </div>
                                        <span>•</span>
                                        {initialStore.deliveryTime && <span>{initialStore.deliveryTime || 'By 10:30am'}</span>}
                                        <span>•</span>
                                        <span>In-store prices</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" className="text-sm text-gray-600">
                                <Shield className="w-4 h-4 mr-2" />
                                100% satisfaction guarantee
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Store Navigation Tabs */}
                <div className="border-t border-gray-200">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex space-x-8">
                            <button className="py-4 border-b-2 border-gray-900 text-gray-900 font-medium">
                                Recipes
                            </button>
                            <button className="py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900">
                                Lists
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto">
                {/* Desktop Layout */}
                <div className="lg:flex">
                    {/* Left Sidebar */}
                    <div className="hidden lg:flex">
                        <CategorySidebar
                            aisles={initialAisles}
                            selectedCategory={selectedCategory}
                            onCategorySelect={setSelectedCategory}
                        />
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-2 p-6">
                        {/* On Sale Section */}
                        <div className="mb-8">
                            <div className="bg-yellow-400 text-black px-4 py-2 rounded-lg mb-4 inline-flex items-center">
                                <span className="font-bold text-lg mr-2">🔥</span>
                                On Sale Now
                            </div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">On Sale Now</h2>
                                <Button variant="ghost" className="text-primary">
                                    View More <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                            <motion.div
                                layout
                                className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6 overflow-hidden"
                            >
                                <AnimatePresence>
                                    {filteredProducts?.slice(0, 8).map((product, index) => (
                                        <MerchantProduct key={product.id} product={product} index={index} />
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative max-w-md mb-6">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 rounded-full"
                            />
                        </div>

                        <motion.div
                            layout
                            className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6 overflow-hidden"
                        >
                            <AnimatePresence>
                                {filteredProducts?.map((product, index) => (
                                    <MerchantProduct key={product.id} product={product} index={index} />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>

            </div>

            {/* Mobile Category Drawer */}
            <MobileCategoryDrawer
                aisles={initialAisles}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />
        </div>
    );
};

export default MerchantProductList;