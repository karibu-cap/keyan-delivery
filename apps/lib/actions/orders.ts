

export async function createOrders(orderData: unknown): Promise<boolean> {
    const response = await fetch('/api/client/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
    });

    if (!response.ok) {
        return false
    }

    return true;
}