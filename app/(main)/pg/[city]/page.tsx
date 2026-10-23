import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { getListingUrl } from "@/lib/url";

export default async function LegacyPGDetailPage(props: { params: Promise<{ city: string }> }) {
  const params = await props.params;
  
  const pg = await db.listing.findUnique({
    where: { slug: params.city },
    include: { city: true, locality: true },
  });

  if (!pg) {
    // If it's a city slug rather than a listing slug (e.g. /pg/noida)
    const city = await db.city.findFirst({ where: { slug: params.city, isActive: true } });
    if (city) {
      redirect(`/pg-in-${city.slug}`);
    }
    notFound();
  }

  // Redirect to the new SEO friendly canonical URL
  redirect(getListingUrl(pg));
}
