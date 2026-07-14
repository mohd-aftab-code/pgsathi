"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export function LogComplaintForm({
  listings,
  tenants,
}: {
  listings: any[];
  tenants: any[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("OTHER");
  const [priority, setPriority] = useState("MEDIUM");
  const [listingId, setListingId] = useState("");
  const [tenantId, setTenantId] = useState("");

  // When a tenant is selected, auto-select their property
  useEffect(() => {
    if (tenantId) {
      const selectedTenant = tenants.find((t) => String(t.id) === tenantId);
      if (selectedTenant && selectedTenant.listingId) {
        setListingId(String(selectedTenant.listingId));
      }
    }
  }, [tenantId, tenants]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !listingId) {
      toast.error("Title and Property are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/manage/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          priority,
          listingId,
          tenantId: tenantId || null,
        }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      toast.success("Complaint logged successfully!");
      router.push("/dashboard/manager/complaints");
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-neutral-600 mb-1">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-base"
          placeholder="e.g., AC not working, Water leakage"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-neutral-600 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-base min-h-[100px]"
          placeholder="Details about the issue..."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1">Tenant (Optional)</label>
          <select value={tenantId} onChange={(e) => setTenantId(e.target.value)} className="input-base">
            <option value="">-- No Tenant --</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.phone})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1">Property *</label>
          <select value={listingId} onChange={(e) => setListingId(e.target.value)} className="input-base" required>
            <option value="">-- Select Property --</option>
            {listings.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-base">
            <option value="PLUMBING">Plumbing</option>
            <option value="ELECTRICAL">Electrical</option>
            <option value="APPLIANCE">Appliance</option>
            <option value="INTERNET">Internet / WiFi</option>
            <option value="CLEANING">Cleaning</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1">Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input-base">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>
      <div className="mt-6 flex gap-3 pt-2">
        <Link href="/dashboard/manager/complaints" className="btn-outline flex-1 text-sm text-center">
          Cancel
        </Link>
        <button type="submit" disabled={submitting} className="btn-primary flex-1 text-sm">
          {submitting ? "Saving…" : "Log Issue"}
        </button>
      </div>
    </form>
  );
}
