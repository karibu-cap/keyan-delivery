
export const updateProduct = async (productId: string, action: 'approve' | 'reject' | 'toggleVisibility') => {
    const result = await fetch(`/api/v1/admin/products/${productId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
    })
    const data = await result.json();
    return data;
}


export const bulkProducts = async (productIds: string[], action: 'approve' | 'reject') => {
    const result = await fetch(`/api/v1/admin/products/bulk`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ productIds, action }),
    })
    const data = await result.json();
    return data;
}

export const deleteProduct = async (productId: string) => {
    const result = await fetch(`/api/v1/admin/products/${productId}`, {
        method: "DELETE",
    })
    const data = await result.json();
    return data;
}
