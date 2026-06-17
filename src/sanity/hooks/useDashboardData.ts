import { useState, useEffect } from "react";
import { fetchDashboardData } from "../lib/dashboardService";
import { DashboardData } from "../types/dashboard";

export interface UseDashboardDataReturn {
  data: DashboardData | null;
  loading: boolean;
  error: Error | null;
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        const dashboardData = await fetchDashboardData();
        if (active) {
          setData(dashboardData);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    // Set up polling interval or live subscription if needed
    const interval = setInterval(loadData, 30000); // Poll every 30s for fallback realtime

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return { data, loading, error };
}
