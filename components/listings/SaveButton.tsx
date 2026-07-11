"use client";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface SaveButtonProps {
  listingId: number;
}

export default function SaveButton({ listingId }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/listings/${listingId}/save`)
      .then(res => res.json())
      .then(data => {
        setIsSaved(data.saved);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [listingId]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent clicking the card link
    e.stopPropagation();

    // Optimistic UI update
    const previousState = isSaved;
    setIsSaved(!isSaved);

    try {
      const res = await fetch(`/api/listings/${listingId}/save`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          // Revert optimistic update and redirect to login
          setIsSaved(previousState);
          toast.error("Please login to save PGs");
          router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
          return;
        }
        throw new Error(data.message || "Failed to save");
      }

      if (data.saved) {
        toast.success("Saved to favorites!");
      } else {
        toast.success("Removed from favorites");
      }
    } catch (err: any) {
      setIsSaved(previousState);
      toast.error(err.message);
    }
  };

  if (loading) return null; // Hide while checking status to prevent flicker

  return (
    <button 
      onClick={toggleSave}
      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-sm z-10 cursor-pointer
        ${isSaved 
          ? "bg-red-50 text-red-500 hover:bg-red-100" 
          : "bg-white/70 text-neutral-500 hover:bg-white hover:text-red-500 hover:scale-110"
        }`}
      aria-label="Save PG"
    >
      <Heart size={18} className={isSaved ? "fill-red-500" : ""} />
    </button>
  );
}
