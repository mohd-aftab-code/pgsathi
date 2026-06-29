import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/lib/data/blogs";
import { Clock, User, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

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
    return {
      title: "Blog Not Found - PGSathi",
    };
  }

  return {
    title: `${post.title} | PGSathi Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.image }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

// Generate static params so these pages can be prerendered
export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    id: post.id.toString(),
  }));
}

export default async function BlogPostPage(props: Props) {
  const params = await props.params;
  const post = BLOG_POSTS.find((p) => p.id.toString() === params.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="bg-neutral-50 min-h-screen py-10 md:py-16">
      <div className="container-max section-padding">
        
        {/* Back Button */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-600 font-medium mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Blog
        </Link>

        {/* Article Header */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {post.category}
            </span>
            <span className="text-neutral-400 text-xs font-bold uppercase tracking-wider">
              {post.readTime}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black text-neutral-900 mb-6 leading-tight tracking-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-between border-t border-b border-neutral-200 py-4 mb-8">
            <div className="flex items-center gap-6 text-sm font-medium text-neutral-600">
              <span className="flex items-center gap-1.5"><User size={16} className="text-neutral-400" /> {post.author}</span>
              <span className="flex items-center gap-1.5"><Clock size={16} className="text-neutral-400" /> {post.date}</span>
            </div>
            
            <button className="flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors">
              <Share2 size={16} /> Share
            </button>
          </div>
        </div>

        {/* Featured Image */}
        <div className="max-w-5xl mx-auto mb-12 rounded-3xl overflow-hidden shadow-lg h-[400px] md:h-[500px]">
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Content */}
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-neutral-200 p-8 md:p-12">
          <div 
            className="prose prose-lg prose-neutral max-w-none 
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-neutral-900
              prose-a:text-primary-600 prose-a:font-medium hover:prose-a:text-primary-700
              prose-img:rounded-2xl prose-img:shadow-md
              prose-ul:list-disc prose-ol:list-decimal"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

      </div>
    </div>
  );
}
