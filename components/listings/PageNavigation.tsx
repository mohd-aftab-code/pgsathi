"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const navItems = [
  { id: "overview", label: "Overview" },
  { id: "charges", label: "Charges" },
  { id: "about", label: "About" },
  { id: "amenities", label: "Amenities" },
  { id: "rooms", label: "Rooms" },
  { id: "rules", label: "Rules" },
  { id: "similar", label: "Similar" }
];

export default function PageNavigation() {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      let current = "";
      for (const item of navItems) {
        const element = document.getElementById(item.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Adjust offset as needed (e.g., 150px from top considering headers)
          if (rect.top <= 150) {
            current = item.id;
          }
        }
      }
      if (current) setActiveId(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Trigger once on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // smooth scroll to element, accounting for sticky headers
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="sticky top-[64px] z-30 bg-[#f8f9fa] border-b border-neutral-200 mt-6 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-4">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => handleClick(e, item.id)}
            className={`whitespace-nowrap font-bold text-sm transition-colors border-b-2 pb-1 ${
              activeId === item.id 
                ? "border-orange-500 text-orange-600" 
                : "border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300"
            }`}
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}
