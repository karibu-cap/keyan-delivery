export interface DeliveryZone {
  id: string;
  name: string;
  code: string;
  deliveryFee: number;
  estimatedDeliveryMinutes: number;
  color: string;
  neighborhoods: string[];
  description: string;
}

/**
 * Get all active delivery zones.
 */
export async function getDeliveryZones(): Promise<DeliveryZone[] | null> {
  const response = await fetch(`/api/v1/delivery-zones`, {
     method: "GET",
     headers: {
        "Content-Type": "application/json",
     },
  });

  if(!response.ok) {
    console.error('Error fetching delivery zones:', response);
    return null;
  }

  const data = await response.json();
  return data.data;
}