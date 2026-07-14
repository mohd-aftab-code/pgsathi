import { Metadata } from 'next';

const defaultSiteName = 'PGSathi';
const defaultDescription = 'Find the best Paying Guest (PG) accommodations, hostels, and co-living spaces for rent in India without any brokerage.';
const defaultUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pgsathi.in';

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
}

export function constructMetadata({
  title = defaultSiteName,
  description = defaultDescription,
  image = '/icon.png',
  noIndex = false,
  canonicalPath,
  keywords = [],
  type = 'website',
  publishedTime,
  authors,
}: ConstructMetadataProps = {}): Metadata {
  const canonicalUrl = canonicalPath ? `${defaultUrl}${canonicalPath}` : defaultUrl;

  const defaultKeywords = ['PG', 'Paying Guest', 'Hostel', 'Co-living', 'Room for rent', 'No brokerage'];
  const allKeywords = [...new Set([...keywords, ...defaultKeywords])].join(', ');

  const metadata: Metadata = {
    title: {
      default: title,
      template: `%s | ${defaultSiteName}`,
    },
    description,
    keywords: allKeywords,
    authors: authors?.map((author) => ({ name: author })) || [{ name: 'PGSathi Team' }],
    creator: 'PGSathi',
    publisher: 'PGSathi',
    metadataBase: new URL(defaultUrl),
    alternates: {
      canonical: canonicalUrl,
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
      title,
      description,
      url: canonicalUrl,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_IN',
      ...(publishedTime && { publishedTime }),
      ...(authors && { authors }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@PGSathi',
    },
  };

  return metadata;
}
