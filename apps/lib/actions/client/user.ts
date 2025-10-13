

export async function getUserWallet(userId: string) {
   const response = await fetch(`/api/v1/users/${userId}/wallet`, {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify({
         userId: userId,
      }),
   });

   return await response.json();
}