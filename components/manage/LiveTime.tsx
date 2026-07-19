"use client";

import { useEffect, useState } from "react";

/**
 * Renders the current time ("· 8:42 PM") next to the server-rendered date and
 * refreshes every 30s. Returns null until mounted so there's no hydration mismatch.
 */
export function LiveTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;
  return <span className="text-neutral-400">· {time}</span>;
}
