import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Generate JSON-LD Schema for Breadcrumbs
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://pgsathi.in/"
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.label,
        "item": item.href ? `https://pgsathi.in${item.href}` : undefined
      }))
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav aria-label="Breadcrumb" className="mb-4 overflow-x-auto scrollbar-hide py-1">
        <ol className="flex items-center gap-1.5 min-w-max text-sm text-neutral-500 font-medium">
          <li className="flex items-center">
            <Link href="/" className="hover:text-primary-600 transition-colors flex items-center gap-1">
              <Home size={14} className="mb-0.5" />
              <span>Home</span>
            </Link>
          </li>
          
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            
            return (
              <li key={index} className="flex items-center gap-1.5">
                <ChevronRight size={14} className="text-neutral-300 shrink-0" />
                {isLast || !item.href ? (
                  <span className="text-neutral-900 font-semibold truncate max-w-[200px] md:max-w-[400px]">
                    {item.label}
                  </span>
                ) : (
                  <Link 
                    href={item.href} 
                    className="hover:text-primary-600 transition-colors truncate max-w-[150px] md:max-w-xs"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
