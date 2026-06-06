import { useEffect, useRef, useState } from "react";
import { recentSales } from "../api/events.api";

// Polls /events/recent-sales every `intervalMs`. New events are stored in
// `events` (capped at 50) so the Toaster can render them and the Dashboard
// can refresh its row list.
export function useSaleAlerts({ enabled = true, intervalMs = 3000 } = {}) {
  const [events, setEvents] = useState([]);
  const sinceRef = useRef(0);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;

    async function tick() {
      try {
        const data = await recentSales(sinceRef.current);
        if (cancelled || !data?.items?.length) return;
        sinceRef.current = data.last || sinceRef.current;
        setEvents((prev) => [...data.items, ...prev].slice(0, 50));
      } catch {
        // ignore — keep polling
      }
    }

    // Don't show historical events on first mount; just set the watermark.
    recentSales(0).then((data) => {
      if (!cancelled && data?.last) sinceRef.current = data.last;
    }).catch(() => {});

    const id = setInterval(tick, intervalMs);
    return () => { cancelled = true; clearInterval(id); };
  }, [enabled, intervalMs]);

  function dismiss(id) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  return { events, dismiss };
}
