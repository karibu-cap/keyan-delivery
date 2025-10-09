

export const createNewMerchant = async (formData: any) => {
    const response = await fetch("/api/merchants/apply", {
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