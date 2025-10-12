
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

   return response.json();
}

export async function fetchDriverPendingOrders() {
   const response = await fetch("/api/v1/driver/orders/available");
   return await response.json();
};

