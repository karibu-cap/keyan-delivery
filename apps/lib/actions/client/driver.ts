
export async function uploadDriverDocuments(cniBase64: string, licenseBase64: string) {
   const response = await fetch("/api/v1/driver/apply", {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify({
         cniBase64: cniBase64,
         licenseBase64: licenseBase64,
      }),
   });

   return await response.json();
}

export async function updateDriverDocuments(data: { cniBase64?: string | null, licenseBase64?: string | null }) {
   const response = await fetch("/api/v1/driver/documents/update", {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify({
         cniBase64: data.cniBase64,
         licenseBase64: data.licenseBase64,
      }),
   });

   return await response.json();
}

export async function updateOrderStatusByDriver(data: {
   action: string;
   pickupCode?: string | undefined;
   deliveryCode?: string | undefined;
   orderId: string;
}) {
   const response = await fetch(`/api/v1/orders/${data.orderId}/status`, {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify({
         action: data.action,
         pickupCode: data.pickupCode,
         deliveryCode: data.deliveryCode,
      }),
   });

   return await response.json();
}

export async function fetchDriverAvailableOrders() {
   const response = await fetch("/api/v1/driver/orders/available");
   return await response.json();
};

export async function fetchDriverInProgressOrders() {
   const response = await fetch("/api/v1/driver/orders/active");
   return await response.json();
};

export async function fetchDriverCompletedOrders() {
    const response = await fetch("/api/v1/driver/orders/complete");
    return await response.json();
};

export async function approveDriver(driverId: string) {
    const result = await fetch(`/api/v1/admin/drivers/${driverId}/approve`, {
        method: "PATCH",
    });

    return result.json();
}

export async function rejectDriver(driverId: string) {
    const result = await fetch(`/api/v1/admin/drivers/${driverId}/reject`, {
        method: "PATCH",
    });

    return result.json();
}

export async function banDriver(driverId: string) {
    const result = await fetch(`/api/v1/admin/drivers/${driverId}/ban`, {
        method: "PATCH",
    });

    return result.json();
}

export async function unbanDriver(driverId: string) {
    const result = await fetch(`/api/v1/admin/drivers/${driverId}/unban`, {
        method: "PATCH",
    });

    return result.json();
}

export async function deleteDriver(driverId: string) {
    const result = await fetch(`/api/v1/admin/drivers/${driverId}/delete`, {
        method: "DELETE",
    });

    return result.json();
}

