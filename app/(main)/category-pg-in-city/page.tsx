import SearchPage from "@/app/(main)/search/page";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const city = searchParams.city as string;
  const category = searchParams.category as string; // boys, girls, coed

  if (!city || !category || !["boys", "girls", "coed"].includes(category)) {
    return { title: "Not Found" };
  }

  const cityName = city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, " ");
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
  const genderText = category === "coed" ? "Co-ed" : categoryName;

  const title = `Best ${genderText} PGs & Hostels in ${cityName} - Zero Brokerage | PGSathi`;
  const description = `Looking for a ${genderText} PG in ${cityName}? Find 100% verified properties, top amenities, and direct owner contacts with zero brokerage on PGSathi.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    alternates: {
      canonical: `https://pgsathi.in/${category}-pg-in-${city}`,
    }
  };
}

export default async function CategoryPgInCityPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const city = searchParams.city as string;
  const category = searchParams.category as string;
  
  if (!city || !category || !["boys", "girls", "coed"].includes(category)) {
    notFound();
  }

  // Inject the city and gender from the URL path into the searchParams
  const updatedSearchParams = Promise.resolve({
    ...searchParams,
    city: city,
    gender: category.toUpperCase(), // BOYS, GIRLS, COED
  });

  return <SearchPage searchParams={updatedSearchParams} />;
}
