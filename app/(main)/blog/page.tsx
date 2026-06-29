import Link from "next/link";
import { ArrowRight, Clock, User } from "lucide-react";

export const metadata = {
  title: "Blog - PGSathi",
  description: "Read the latest tips, guides, and news about finding PGs and living away from home.",
};

import { BLOG_POSTS } from "@/lib/data/blogs";

export default function BlogPage() {
  return (
    <div className="bg-neutral-50 min-h-screen py-16 md:py-24">
      <div className="container-max section-padding">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 mb-6 tracking-tight">
            The PGSathi Blog
          </h1>
          <p className="text-xl text-neutral-600 leading-relaxed">
            Tips, guides, and stories to help you find the best PGs and live comfortably away from home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post) => (
            <article key={post.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-neutral-200 group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <div className="h-56 overflow-hidden relative">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary-700">
                  {post.category}
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-xs font-medium text-neutral-500 mb-4">
                  <span className="flex items-center gap-1"><Clock size={14} /> {post.date}</span>
                  <span className="flex items-center gap-1"><User size={14} /> {post.author}</span>
                </div>
                
                <h2 className="text-xl font-bold text-neutral-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                  {post.title}
                </h2>
                
                <p className="text-neutral-600 text-sm mb-6 line-clamp-3 flex-1">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-100">
                  <span className="text-xs font-bold text-neutral-400">{post.readTime}</span>
                  <Link href={`/blog/${post.id}`} className="text-primary-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read More <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-20 bg-primary-900 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <h2 className="text-3xl font-bold mb-4 relative z-10">Subscribe to our Newsletter</h2>
          <p className="text-primary-200 mb-8 max-w-xl mx-auto relative z-10">
            Get the latest PG hunting tips and exclusive offers directly in your inbox. No spam, we promise.
          </p>
          
          <form className="max-w-md mx-auto relative z-10 flex gap-2">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 px-5 py-3 rounded-xl text-neutral-900 outline-none focus:ring-4 focus:ring-primary-500/50"
              required
            />
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
              Subscribe
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
