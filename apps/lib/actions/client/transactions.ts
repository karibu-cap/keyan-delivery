export async function getTransactions(data: {
   walletId: string;
}) {
   const response = await fetch(`/api/v1/transactions/${data.walletId}`, {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify({
         walletId: data.walletId,
      }),
   });

   return await response.json();
}