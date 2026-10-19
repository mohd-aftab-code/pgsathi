import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";

export interface PlatformStats {
  pgCount: number;
  cityCount: number;
  tenantCount: number;
  ownerCount: number;
  userCount: number;
}

export const getPlatformStats = unstable_cache(
  async (): Promise<PlatformStats> => {
    try {
      const [pgCount, activeCitiesGroup, tenantCount, ownerCount, userCount] = await Promise.all([
        db.listing.count({
          where: { isActive: true },
        }),
        db.listing.groupBy({
          by: ["cityId"],
          where: { isActive: true, cityId: { not: null } },
        }),
        db.user.count({
          where: { role: "TENANT" },
        }),
        db.user.count({
          where: { role: "OWNER" },
        }),
        db.user.count(),
      ]);

      return {
        pgCount,
        cityCount: activeCitiesGroup.length,
        tenantCount,
        ownerCount,
        userCount,
      };
    } catch (error) {
      console.error("[getPlatformStats] DB connection error:", error);
      return {
        pgCount: 0,
        cityCount: 0,
        tenantCount: 0,
        ownerCount: 0,
        userCount: 0,
      };
    }
  },
  ["platform-stats"],
  { revalidate: 30, tags: ["platform-stats", "hero-data"] }
);

export function formatStatNumber(val: number): string {
  if (!val || val <= 0) return "0";
  if (val >= 1000) {
    return `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k+`;
  }
  if (val >= 100) {
    return `${val}+`;
  }
  return String(val);
}
