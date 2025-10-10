import { OrderStatus, ProductStatus } from "@prisma/client";


export const createNewMerchant = async (formData: Record<string, unknown>) => {
    const response = await fetch("/api/v1/merchants/apply", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            businessName: formData.businessName,
            phone: formData.phone,
            merchantType: formData.merchantType,
            address: formData.address,
            latitude: formData.latitude,
            longitude: formData.longitude,
            logoUrl: formData.logoUrl,
            bannerUrl: formData.bannerUrl,
            categories: formData.categories,
        }),
    });

    if (!response.ok) {
        return false;
    }
    return true;
}

export async function createMerchantProduct(formData: Record<string, unknown>, merchantId: string) {
    console.log(formData);
    try {
        const response = await fetch(`/api/v1/merchants/${merchantId}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Failed to create product',
            };
        }

        return data;
    } catch (error) {
        console.error('Error creating product:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

export async function updateMerchantProduct({
    id,
    formData,
    merchantId,
}: {
    id: string;
    formData: Record<string, unknown>;
    merchantId: string;
}) {
    try {
        const response = await fetch(`/api/v1/merchants/${merchantId}/products/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Failed to update product',
            };
        }

        return data;
    } catch (error) {
        console.error("Error updating product:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }

}

export async function updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    merchantId: string,
) {
    try {
        const response = await fetch(`/api/v1/merchants/${merchantId}/orders/${orderId}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                newStatus,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Failed to update order status',
            };
        }

        return data;
    } catch (error) {
        console.error("Error updating order status:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

export async function getMerchantProducts(
    merchantId: string,
    filters?: {
        status?: ProductStatus;
        search?: string;
        limit?: number;
        offset?: number;
    }
) {
    try {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.offset) params.append('offset', filters.offset.toString());

        const response = await fetch(`/api/v1/merchants/${merchantId}/products?${params.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                products: [],
                total: 0,
            };
        }
        return data;
    } catch (error) {
        console.error("Error fetching merchant products:", error);
        return {
            success: false,
            products: [],
            total: 0,
        };
    }
}

export async function getMerchantOrders(
    merchantId: string,
    type: "active" | "history" = "active"
) {
    try {
        const params = new URLSearchParams();
        params.append('type', type);

        const response = await fetch(`/api/v1/merchants/${merchantId}/orders?${params.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                orders: [],
                pendingCount: 0,
            };
        }

        return data;
    } catch (error) {
        console.error("Error fetching merchant orders:", error);
        return {
            success: false,
            orders: [],
            pendingCount: 0,
        };
    }
}

export async function deleteProduct(productId: string, merchantId: string) {
    try {
        const response = await fetch(`/api/v1/merchants/${merchantId}/products/${productId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Failed to delete product',
            };
        }

        return data;
    } catch (error) {
        console.error("Error deleting product:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}