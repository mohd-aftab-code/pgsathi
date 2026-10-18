import { Metadata } from 'next';

const defaultSiteName = 'PGSathi';
const defaultDescription = 'Find the best Paying Guest (PG) accommodations, hostels, and co-living spaces for rent in India without any brokerage.';
const defaultUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pgsathi.in';

interface ConstructMetadataProps {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  canonicalPath?: string;
  keywords?: string[];
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  authors?: string[];
  languages?: Record<string, string>;
}

export function constructMetadata({
  title = defaultSiteName,
  description = defaultDescription,
  image = '/og-image.jpg',
  noIndex = false,
  canonicalPath,
  keywords = [],
  type = 'website',
  publishedTime,
  authors,
  languages,
}: ConstructMetadataProps = {}): Metadata {
  const canonicalUrl = canonicalPath ? `${defaultUrl}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}` : defaultUrl;

  // Rule 1: <title> max 60 chars, meta description max 155 chars
  const cleanTitle = title.length > 60 ? `${title.slice(0, 57).trim()}...` : title;
  const cleanDescription = description.length > 155 ? `${description.slice(0, 152).trim()}...` : description;

  const defaultKeywords = ['PG', 'Paying Guest', 'Hostel', 'Co-living', 'Room for rent', 'Zero brokerage', 'PG list platform'];
  const allKeywords = [...new Set([...keywords, ...defaultKeywords])].join(', ');

  const defaultLanguages: Record<string, string> = {
    'en-IN': canonicalUrl,
    ...(languages || {}),
  };

  const metadata: Metadata = {
    title: cleanTitle,
    description: cleanDescription,
    keywords: allKeywords,
    authors: authors?.map((author) => ({ name: author })) || [{ name: 'PGSathi Team' }],
    creator: 'PGSathi',
    publisher: 'PGSathi',
    metadataBase: new URL(defaultUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: defaultLanguages,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type,
      siteName: defaultSiteName,
      title: cleanTitle,
      description: cleanDescription,
      url: canonicalUrl,
      images: [
        {
          url: image.startsWith('http') ? image : `${defaultUrl}${image.startsWith('/') ? image : `/${image}`}`,
          width: 1200,
          height: 630,
          alt: cleanTitle,
        },
      ],
      locale: 'en_IN',
      ...(publishedTime && { publishedTime }),
      ...(authors && { authors }),
    },
    twitter: {
      card: 'summary_large_image',
      title: cleanTitle,
      description: cleanDescription,
      images: [image.startsWith('http') ? image : `${defaultUrl}${image.startsWith('/') ? image : `/${image}`}`],
      creator: '@PGSathi',
    },
  };

  return metadata;
}
