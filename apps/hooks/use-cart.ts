import { toast } from '@/hooks/use-toast';
import type { Cart } from '@/types/cart';
import { DeliveryInfo } from '@prisma/client';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface CartShipment {
    method: 'DELIVERY' | 'EXPEDITION'
    cost: number
    location: string
}

interface CartStore {
    cart: Cart,
    addItem: ({ productId, quantity, price }: { productId: string, quantity: number, price: number }) => void
    removeItem: (idToRemove: string) => void
    updateQuantity: (id: string, quantity: number) => void
    clearCart: () => void
}

interface SideBarCart {
    isSideBarCartOpen: boolean
    onOpenChange: (value: boolean) => void
}

interface CartDeliveryInfo {
    cartDeliveryInfo?: Partial<DeliveryInfo>
    clearDeliveryInfo: () => void
    setShipment: (shipment?: Partial<DeliveryInfo>) => void
}

const useCartSideBar = create<SideBarCart>(set => ({
    isSideBarCartOpen: false,
    onOpenChange: (value: boolean) => set({ isSideBarCartOpen: value }),
}))

const useCartDeliveryInfo = create<CartDeliveryInfo>(set => ({
    clearDeliveryInfo: () => set({ cartDeliveryInfo: undefined }),
    setShipment(shipment) {
        set({ cartDeliveryInfo: shipment })
    },
}))

const useCart = create(
    persist<CartStore>(
        (set, _) => ({
            cart: {
                items: [],
                total: 0,
                itemCount: 0,
            },
            addItem: async ({ productId, quantity, price }: { productId: string; quantity: number; price: number; }) => {
                const response = await fetch('/api/v1/client/cart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ productId, quantity, price }),
                })

                const responseJson = await response.json()
                if (!responseJson.success) {
                    toast({
                        title: '❌ Failed to add item to cart',
                        description: responseJson.error,
                        variant: 'destructive'
                    })
                    return
                }



                const updatedItems = await fetch('/api/v1/client/cart')
                const updatedItemsJson = await updatedItems.json()
                console.log(responseJson, updatedItemsJson.data)

                set({ cart: updatedItemsJson.data })
                toast({
                        title: '🎉 Item added to cart',
                        description: `added successfully`,
                    })

            },
            removeItem: async (productId: string) => {
               
                const response = await fetch('/api/v1/client/cart', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        productId,
                    }),
                })

                const responseJson = await response.json()
                if (!responseJson.success) {
                    toast({
                        title: '❌ Failed to remove item from cart',
                        description: responseJson.error,
                        variant: 'destructive'
                    })
                    return
                }

                const updatedItems = await fetch('/api/v1/client/cart')
                const updatedItemsJson = await updatedItems.json()
                set({ cart: updatedItemsJson.data })
                toast({
                        title: 'Item removed from cart',
                        description: `removed successfully`,
                    })
               
            },
            updateQuantity: async (id: string, quantity: number) => {
               
                const response = await fetch('/api/v1/client/cart', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        productId: id,
                        quantity,
                    }),
                })

                const responseJson = await response.json()
                if (!responseJson.success) {
                    toast({
                        title: '❌ Failed to update item quantity',
                        description: responseJson.error,
                        variant: 'destructive'
                    })
                    return
                }

                const updatedItems = await fetch('/api/v1/client/cart')
                const updatedItemsJson = await updatedItems.json()
                set({ cart: updatedItemsJson.data })
                toast({
                        title: '✅ Quantity updated',
                        description: `new quantity to ${quantity}`,
                    })
            },
            clearCart: async () => {
                const response =  await fetch('/api/v1/client/cart/clean', {
                    method: 'DELETE',
                })
                const responseJson = await response.json()
                if (!responseJson.success) {
                    toast({
                        title: '❌ Failed to clear cart',
                        description: responseJson.error,
                        variant: 'destructive'
                    })
                    return
                }
                const updatedItems = await fetch('/api/v1/client/cart')
                const updatedItemsJson = await updatedItems.json()
                set({ cart: updatedItemsJson.data })
            },
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        },
    ),
)

export { useCart, useCartDeliveryInfo, useCartSideBar };

