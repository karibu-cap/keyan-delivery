
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

export async function fetchDriverAvailableOrders() {
   const response = await fetch("/api/v1/driver/orders/available");
   return await response.json();
};

export async function fetchDriverInProgressOrders() {
   const response = await fetch("/api/v1/driver/orders/active");
   return await response.json();
};

