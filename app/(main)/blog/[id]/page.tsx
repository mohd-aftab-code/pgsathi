import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/lib/data/blogs";
import { Clock, User, ArrowLeft, ChevronRight, BookOpen, Sparkles, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import { safeJsonLd } from "@/lib/json-ld";
import { BlogShareButton } from "@/components/blog/BlogShareButton";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const post = BLOG_POSTS.find((p) => p.id.toString() === params.id);
  
  if (!post) {
    return { title: "Blog Not Found - PGSathi" };
  }

  return constructMetadata({
    title: `${post.title} | PGSathi Blog`,
    description: post.excerpt,
    image: post.image,
    type: 'article',
    canonicalPath: `/blog/${post.id}`,
    publishedTime: post.date,
    authors: [post.author],
    keywords: post.keywords,
  });
}

export default async function BlogPostPage(props: Props) {
  const params = await props.params;
  const post = BLOG_POSTS.find((p) => p.id.toString() === params.id);

  if (!post) {
    notFound();
  }

  // Find 2 or 3 related articles (excluding the current one)
  const relatedPosts = BLOG_POSTS
    .filter((p) => p.id !== post.id)
    .slice(0, 3);

  const fullImageUrl = post.image.startsWith("http")
    ? post.image
    : `https://pgsathi.in${post.image}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "image": [fullImageUrl],
    "datePublished": post.date,
    "dateModified": post.date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://pgsathi.in/blog/${post.id}`
    },
    "publisher": {
      "@type": "Organization",
      "name": "PGSathi",
      "logo": {
        "@type": "ImageObject",
        "url": "https://pgsathi.in/logo-vertical.png"
      }
    },
    "author": [{
      "@type": "Person",
      "name": post.author,
      "url": "https://pgsathi.in/about"
    }]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <article className="bg-neutral-50/70 min-h-screen py-8 sm:py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm text-neutral-500 mb-6 sm:mb-8 overflow-x-auto no-scrollbar whitespace-nowrap">
            <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight size={13} className="text-neutral-400 shrink-0" />
            <Link href="/blog" className="hover:text-primary-600 transition-colors">Blog</Link>
            <ChevronRight size={13} className="text-neutral-400 shrink-0" />
            <span className="text-neutral-800 font-semibold truncate max-w-[200px] sm:max-w-xs">{post.title}</span>
          </nav>

          {/* Article Header */}
          <header className="mb-6 sm:mb-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
                  {post.category}
                </span>
                <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <Clock size={13} /> {post.readTime}
                </span>
              </div>
              <BlogShareButton title={post.title} slug={post.id} />
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-neutral-900 leading-[1.2] sm:leading-[1.25] tracking-tight mb-4">
              {post.title}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-neutral-600 leading-relaxed font-normal mb-6">
              {post.excerpt}
            </p>
            
            {/* Author and Date Meta Bar */}
            <div className="flex flex-wrap items-center justify-between border-t border-b border-neutral-200/80 py-3.5 sm:py-4 gap-3 text-xs sm:text-sm text-neutral-600">
              <div className="flex items-center gap-4 sm:gap-6">
                <span className="flex items-center gap-1.5 font-semibold text-neutral-800">
                  <User size={15} className="text-primary-600" /> {post.author}
                </span>
                <span className="text-neutral-300">|</span>
                <span className="text-neutral-500">
                  Published on {post.date}
                </span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="w-full aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-neutral-200/60 mb-8 sm:mb-12 bg-neutral-200">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Content Container */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-neutral-200/90 p-5 sm:p-8 md:p-12 lg:p-14">
            <div 
              className="prose prose-neutral max-w-none 
                prose-headings:font-black prose-headings:tracking-tight prose-headings:text-neutral-900
                prose-h2:text-xl sm:prose-h2:text-2xl md:prose-h2:3xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-sm sm:prose-p:text-base md:prose-p:text-lg prose-p:leading-relaxed prose-p:text-neutral-700
                prose-a:text-primary-600 prose-a:font-bold prose-a:underline hover:prose-a:text-primary-700
                prose-img:rounded-2xl prose-img:shadow-md
                prose-ul:list-disc prose-ul:pl-5 prose-ul:my-4 prose-li:my-1.5
                prose-ol:list-decimal prose-ol:pl-5 prose-ol:my-4 prose-li:my-1.5
                prose-strong:text-neutral-900 prose-strong:font-bold"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Article Footer Share Bar */}
          <div className="mt-8 p-5 sm:p-6 bg-white rounded-2xl border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-primary-600" />
              <span className="text-xs sm:text-sm font-bold text-neutral-800">Did you find this guide helpful? Share it with fellow PG seekers or owners!</span>
            </div>
            <BlogShareButton title={post.title} slug={post.id} />
          </div>

          {/* Related Articles Section */}
          {relatedPosts.length > 0 && (
            <section className="mt-14 sm:mt-20 pt-10 border-t border-neutral-200">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
                    <BookOpen size={20} className="text-primary-600" />
                    Recommended Next Reads
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-1">Explore more expert guides on finding safe PGs and growing your rental business.</p>
                </div>
                <Link href="/blog" className="text-primary-600 hover:text-primary-700 font-bold text-xs sm:text-sm hidden sm:inline-flex items-center gap-1">
                  View all <ArrowUpRight size={15} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
                {relatedPosts.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/blog/${rel.id}`}
                    className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col hover:-translate-y-1"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-neutral-100 relative">
                      <img
                        src={rel.image}
                        alt={rel.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-white/95 px-2 py-0.5 rounded-full text-[10px] font-bold text-primary-700">
                        {rel.category}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-[11px] font-semibold text-neutral-400 mb-1.5">
                          {rel.readTime} · {rel.date}
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug mb-2">
                          {rel.title}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                          {rel.excerpt}
                        </p>
                      </div>
                      <div className="pt-3 mt-3 border-t border-neutral-100 text-xs font-bold text-primary-600 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                        Read Guide <ChevronRight size={13} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>
      </article>
    </>
  );
}
