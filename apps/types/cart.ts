import type { IProduct } from "@/lib/actions/server/stores";

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