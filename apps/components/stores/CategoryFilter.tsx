import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Category } from "@/lib/actions/stores";
import { ShoppingBag, Pill, UtensilsCrossed } from "lucide-react";


interface CategoryFilterProps {
    categories: Category[];
    selectedCategory: string;
    onCategoryChange: (categoryId: string) => void;
}

const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
        case 'grocery':
            return ShoppingBag;
        case 'pharmacy':
            return Pill;
        case 'food':
            return UtensilsCrossed;
        default:
            return ShoppingBag;
    }
};

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) => {
    return (
        <>
            <section className="hidden md:block py-8 px-4 border-b border-border bg-card">
                <div className="container mx-auto max-w-7xl">
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {categories.map((category) => {
                            const IconComponent = getCategoryIcon(category.id);
                            return (
                                <Button
                                    key={category.id}
                                    variant={selectedCategory === category.id ? "default" : "outline"}
                                    onClick={() => onCategoryChange(category.id)}
                                    className="rounded-2xl whitespace-nowrap"
                                >
                                    <IconComponent className="w-4 h-4 mr-2" />
                                    {category.name}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            </section>

            <div className="hidden max-md:block px-4 pb-4 py-8">
                <Select value={selectedCategory} onValueChange={onCategoryChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </>
    );
};

export default CategoryFilter;