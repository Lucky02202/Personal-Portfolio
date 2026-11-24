"use client";

import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  const id = window.setInterval(cb, 15_000);
  return () => window.clearInterval(id);
}

/** Your local time, rendered on the client only (avoids a hydration mismatch). */
export function LocalTime({ timeZone }: { timeZone: string }) {
  const time = useSyncExternalStore(
    subscribe,
    () =>
      new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone, hour12: false }).format(
        new Date(),
      ),
    () => "--:--",
  );
  return (
    <time suppressHydrationWarning className="tabular-nums">
      {time}
    </time>
  );
}
