export async function fetchOrderDetails(data: {
   orderId: string;
}) {
   const response = await fetch(`/api/v1/orders/${data.orderId}`);

   return await response.json();
}