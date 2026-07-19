"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function EditEmailButton({ currentEmail }: { currentEmail: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(currentEmail);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success("Email updated");
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update email");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        onClick={() => { setEmail(currentEmail); setOpen(true); }}
        className="text-sm font-bold text-primary-600 hover:underline cursor-pointer"
      >
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-neutral-900 mb-4">Update Email Address</h3>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 text-sm"
              placeholder="you@example.com"
              autoFocus
            />
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-neutral-500 bg-neutral-100 hover:bg-neutral-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !email}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
