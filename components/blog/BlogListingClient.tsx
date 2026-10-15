"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Clock, User, Search, Sparkles, X } from "lucide-react";
import type { BlogPost } from "@/lib/data/blogs";

interface Props {
  posts: BlogPost[];
}

export function BlogListingClient({ posts }: Props) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCat =
        selectedCategory === "All" ||
        post.category.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        (post.keywords && post.keywords.some((k) => k.toLowerCase().includes(q)));

      return matchesCat && matchesSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  const featuredPost = filteredPosts[0];
  const gridPosts = filteredPosts.slice(1);

  return (
    <div className="space-y-10 sm:space-y-14">
      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-neutral-200/80 shadow-sm">
        {/* Horizontal Category Chips */}
        <div className="w-full md:w-auto overflow-x-auto pb-1 md:pb-0 flex items-center gap-1.5 sm:gap-2 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary-600 text-white shadow-md shadow-primary-500/25 scale-[1.02]"
                    : "bg-neutral-100 hover:bg-neutral-200/80 text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles, topics..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-neutral-100 rounded-xl sm:rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium placeholder:text-neutral-400 text-neutral-800 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* When no posts match */}
      {filteredPosts.length === 0 && (
        <div className="py-16 text-center bg-white rounded-3xl border border-neutral-200 p-8">
          <p className="text-base sm:text-lg font-bold text-neutral-700 mb-2">No articles found matching your criteria</p>
          <p className="text-xs sm:text-sm text-neutral-500 mb-5">Try adjusting your search query or switching categories.</p>
          <button
            onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
            className="px-5 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-xs sm:text-sm hover:bg-primary-700 transition"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Featured / Hero Post */}
      {featuredPost && (
        <article className="group bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Image */}
            <div className="lg:col-span-7 relative overflow-hidden aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto min-h-[240px] sm:min-h-[320px] lg:min-h-[420px]">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black text-primary-700 uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <Sparkles size={13} className="text-primary-600" />
                Featured Guide
              </div>
            </div>

            {/* Content info */}
            <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-neutral-500 mb-3">
                  <span className="bg-primary-50 text-primary-700 px-2.5 py-0.5 rounded-lg font-bold">
                    {featuredPost.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} /> {featuredPost.readTime}
                  </span>
                  <span>·</span>
                  <span>{featuredPost.date}</span>
                </div>

                <Link href={`/blog/${featuredPost.id}`}>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-neutral-900 group-hover:text-primary-600 transition-colors tracking-tight leading-snug mb-3.5">
                    {featuredPost.title}
                  </h2>
                </Link>

                <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed line-clamp-3 sm:line-clamp-4 mb-6">
                  {featuredPost.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400 flex items-center gap-1.5">
                  <User size={13} /> {featuredPost.author}
                </span>
                <Link
                  href={`/blog/${featuredPost.id}`}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary-600 group-hover:text-primary-700 group-hover:translate-x-0.5 transition-all"
                >
                  Read Complete Guide <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </article>
      )}

      {/* Grid for Remaining Posts */}
      {gridPosts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8">
          {gridPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-neutral-200/80 group transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              {/* Image */}
              <div className="aspect-[16/10] overflow-hidden relative bg-neutral-100">
                <img
                  src={post.image}
                  alt={post.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-0.5 rounded-full text-[11px] font-bold text-primary-700 shadow-sm">
                  {post.category}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-xs font-medium text-neutral-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock size={13} /> {post.date}
                    </span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>

                  <Link href={`/blog/${post.id}`}>
                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2.5 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-neutral-600 text-xs sm:text-sm mb-5 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3.5 border-t border-neutral-100 mt-auto">
                  <span className="text-[11px] font-semibold text-neutral-400 truncate max-w-[140px]">
                    By {post.author}
                  </span>
                  <Link
                    href={`/blog/${post.id}`}
                    className="text-primary-600 font-bold text-xs sm:text-sm flex items-center gap-1 group-hover:gap-1.5 transition-all shrink-0"
                  >
                    Read More <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
