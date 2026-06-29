import SearchPage from "@/app/(main)/search/page";
import { Metadata } from "next";

export async function generateMetadata(props: {
  params: Promise<{ city: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const params = await props.params;
  const city = params.city;
  const cityName = city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, " ");

  const title = `Best PGs & Hostels in ${cityName} - Zero Brokerage | PGSathi`;
  const description = `Looking for a PG in ${cityName}? Find 100% verified properties, top amenities, and direct owner contacts with zero brokerage on PGSathi.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    alternates: {
      canonical: `https://pgsathi.in/pg-in-${city}`,
    }
  };
}

export default async function PgInCityPage(props: {
  params: Promise<{ city: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  // Inject the city from the URL path into the searchParams for the SearchPage component
  const updatedSearchParams = Promise.resolve({
    ...searchParams,
    city: params.city,
  });

  return <SearchPage searchParams={updatedSearchParams} />;
}
