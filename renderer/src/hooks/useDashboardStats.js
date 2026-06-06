import { useCallback, useEffect, useState } from "react";
import { getDashboardStats } from "../api/products.api";

export function useDashboardStats({ refreshKey = 0 } = {}) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
      setError("");
    } catch (e) {
      setError(e.message || "Failed to load stats");
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh, refreshKey]);

  return { stats, error, refresh };
}
