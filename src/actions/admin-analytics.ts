"use server";

import { assertAdmin } from "@/lib/auth-guard";
import {
  fetchAdminAnalyticsDataService,
  AnalyticsData,
} from "@/lib/services/admin.analytics.service";

export async function fetchAdminAnalyticsData(): Promise<
  AnalyticsData | { success: boolean; error?: string }
> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;

  try {
    return await fetchAdminAnalyticsDataService();
  } catch (error) {
    console.error("Failed to compile analytics data:", error);
    throw new Error("Failed to compile analytics data.");
  }
}
