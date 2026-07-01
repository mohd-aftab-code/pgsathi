import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";

export default async function LegacyPGDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  
  const pg = await db.listing.findUnique({
    where: { slug: params.slug },
    include: { city: true, locality: true },
  });

  if (!pg) notFound();

  // Redirect to the new SEO friendly URL structure
  const citySlug = pg.city?.slug || "unknown";
  const localitySlug = pg.locality?.slug || "all";
  
  redirect(`/pg/${citySlug}/${localitySlug}/${pg.slug}`);
}

