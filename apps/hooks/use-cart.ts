import { toast } from '@/hooks/use-toast'
import { IProduct } from '@/lib/actions/stores'
import { DeliveryInfo } from '@prisma/client'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
export interface CartShipment {
    method: 'DELIVERY' | 'EXPEDITION'
    cost: number
    location: string
}
export interface CartItem {
    product: IProduct
    quantity: number
    price: number
}

interface CartStore {
    cartItems: CartItem[]
    total: number
    totalItems: number
    addItem: (item: CartItem) => void
    removeItem: (idToRemove: string) => void
    increaseQuantity: (idToIncrease: string) => void
    decreaseQuantity: (idToDecrease: string) => void
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
        (set, get) => ({
            cartItems: [],
            get items() {
                return get().cartItems
            },
            get total() {
                return get().cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            },
            get totalItems() {
                return get().cartItems.reduce((sum, item) => sum + item.quantity, 0)
            },
            addItem: (data: CartItem) => {
                const { product, quantity, price } = data
                const currentItems = get().cartItems
                const isExisting = currentItems.find(cartItem => cartItem.product.id === product.id)

                // Check inventory
                const availableStock = product.inventory?.stockQuantity || 0
                if (availableStock < quantity) {
                    toast({
                        title: '❌ Insufficient stock',
                        description: `Only ${availableStock} items available`,
                        variant: 'destructive'
                    })
                    return
                }

                if (isExisting) {
                    const newQuantity = isExisting.quantity + quantity
                    if (availableStock < newQuantity) {
                        toast({
                            title: '❌ Insufficient stock',
                            description: `Only ${availableStock} items available`,
                            variant: 'destructive'
                        })
                        return
                    }

                    const updatedItems = currentItems.map(cartItem =>
                        cartItem.product.id === product.id
                            ? { ...cartItem, quantity: newQuantity, price }
                            : cartItem
                    )
                    set({ cartItems: updatedItems })
                    toast({
                        title: '✅ Quantity updated',
                        description: `${product.title} quantity increased to ${newQuantity}`,
                    })
                } else {
                    set({ cartItems: [...currentItems, { product, quantity, price }] })
                    toast({
                        title: '🎉 Item added to cart',
                        description: `${product.title} added successfully`,
                    })
                }
            },
            removeItem: (idToRemove: string) => {
                const newCartItems = get().cartItems.filter(
                    cartItem => cartItem.product.id !== idToRemove,
                )
                set({ cartItems: newCartItems })

                if (newCartItems.length === 0) {
                    useCartDeliveryInfo.getState().clearDeliveryInfo()
                }
            },
            increaseQuantity: (idToIncrease: string) => {
                const currentItems = get().cartItems
                const item = currentItems.find(cartItem => cartItem.product.id === idToIncrease)

                if (!item) return

                const availableStock = item.product.inventory?.stockQuantity || 0
                if (item.quantity >= availableStock) {
                    toast({
                        title: '❌ Insufficient stock',
                        description: `Only ${availableStock} items available`,
                        variant: 'destructive'
                    })
                    return
                }

                const newCartItems = currentItems.map(cartItem =>
                    cartItem.product.id === idToIncrease
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem,
                )
                set({ cartItems: newCartItems })
            },
            decreaseQuantity: (idToDecrease: string) => {
                const currentItems = get().cartItems
                const item = currentItems.find(cartItem => cartItem.product.id === idToDecrease)

                if (!item) return

                if (item.quantity <= 1) {
                    // Remove item when quantity reaches 0
                    const newCartItems = currentItems.filter(
                        cartItem => cartItem.product.id !== idToDecrease
                    )
                    set({ cartItems: newCartItems })

                    if (currentItems.length === 1) {
                        useCartDeliveryInfo.getState().clearDeliveryInfo()
                    }
                } else {
                    // Decrease quantity
                    const newCartItems = currentItems.map(cartItem =>
                        cartItem.product.id === idToDecrease
                            ? { ...cartItem, quantity: cartItem.quantity - 1 }
                            : cartItem
                    )
                    set({ cartItems: newCartItems })
                }
            },
            updateQuantity: (id: string, quantity: number) => {
                const currentItems = get().cartItems
                const item = currentItems.find(cartItem => cartItem.product.id === id)

                if (!item) return

                if (quantity <= 0) {
                    // Remove item when quantity is 0 or negative
                    const newCartItems = currentItems.filter(
                        cartItem => cartItem.product.id !== id
                    )
                    set({ cartItems: newCartItems })

                    if (currentItems.length === 1) {
                        useCartDeliveryInfo.getState().clearDeliveryInfo()
                    }
                } else {
                    // Check inventory before updating
                    const availableStock = item.product.inventory?.stockQuantity || 0
                    if (quantity > availableStock) {
                        toast({
                            title: '❌ Insufficient stock',
                            description: `Only ${availableStock} items available`,
                            variant: 'destructive'
                        })
                        return
                    }

                    const newCartItems = currentItems.map(cartItem =>
                        cartItem.product.id === id
                            ? { ...cartItem, quantity }
                            : cartItem
                    )
                    set({ cartItems: newCartItems })
                }
            },
            clearCart: () => {
                set({ cartItems: [] })
                useCartDeliveryInfo.getState().clearDeliveryInfo()
            },
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        },
    ),
)

export { useCart, useCartDeliveryInfo, useCartSideBar }
