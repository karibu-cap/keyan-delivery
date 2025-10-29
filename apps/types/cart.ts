import type { IProduct } from "@/types/generic_types";

export interface CartItem {
    product: IProduct;
    quantity: number;
    price: number;
}

export interface Cart {
    items: CartItem[];
    total: number;
    itemCount: number;
}