"use client";

import { useEffect } from "react";

/** Fires a fire-and-forget view-count ping once per mount. Renders nothing. */
export default function ViewTracker({ listingId }: { listingId: number }) {
  useEffect(() => {
    fetch(`/api/listings/${listingId}/view`, { method: "POST" }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  return null;
}
