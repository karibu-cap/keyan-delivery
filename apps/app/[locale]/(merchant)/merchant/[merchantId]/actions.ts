"use server";

import { revalidatePath } from "next/cache";

/**
 * Server action to revalidate merchant dashboard data
 * Called after order status updates to refresh the UI
 */
export async function revalidateMerchantDashboard(merchantId: string) {
  revalidatePath(`/merchant/${merchantId}`);
  revalidatePath(`/merchant/${merchantId}`, 'page');
}