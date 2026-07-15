"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export function DeleteRoomBtn({ roomId }: { roomId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this room and all its beds?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/manage/rooms/${roomId}`, {
        method: "DELETE",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Failed to delete room");
      
      toast.success("Room deleted successfully");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors ml-2"
      title="Delete Room"
    >
      <Trash2 size={12} />
    </button>
  );
}
