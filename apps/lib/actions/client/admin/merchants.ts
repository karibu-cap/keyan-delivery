
export const approveMerchant = async (merchantId: string) => {
    const result = await fetch(`/api/admin/merchants/${merchantId}/approve`, {
        method: "PATCH",
    })
    const data = await result.json();
    return data;
}

export const rejectMerchant = async (merchantId: string) => {
    const result = await fetch(`/api/admin/merchants/${merchantId}/reject`, {
        method: "PATCH",
    })
    const data = await result.json();
    return data;
}

export const deleteMerchant = async (merchantId: string) => {
    const result = await fetch(`/api/admin/merchants/${merchantId}/delete`, {
        method: "DELETE",
    })
    const data = await result.json();
    return data;
}
