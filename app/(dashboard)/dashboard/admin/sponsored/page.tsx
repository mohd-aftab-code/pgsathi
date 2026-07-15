"use client";
import { useState, useEffect } from "react";
import { Star, Building2, ToggleLeft, ToggleRight, Calendar } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSponsoredPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sponsored");
      const d = await res.json();
      if (d.success) setData(d.data);
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  async function toggleSponsorship(listingId: number, isCurrentlyFeatured: boolean) {
    let days = 0;
    if (!isCurrentlyFeatured) {
      const input = prompt("How many days should this listing be sponsored?");
      if (!input || isNaN(parseInt(input))) return;
      days = parseInt(input);
    }

    if (!confirm(`Are you sure you want to ${isCurrentlyFeatured ? 'remove' : 'add'} sponsorship?`)) return;
    
    setProcessing(true);
    try {
      const res = await fetch("/api/admin/sponsored", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, isFeatured: !isCurrentlyFeatured, days })
      });
      const d = await res.json();
      if (d.success) {
        toast.success(d.message);
        fetchData();
      } else {
        toast.error(d.message);
      }
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return <div className="p-8 text-center">Loading listings...</div>;

  return (
    <div className="space-y-8">
      <div className="border-b border-neutral-200 pb-5">
        <h1 className="text-2xl font-extrabold text-neutral-900 flex items-center gap-2">
          <Star className="text-amber-500" size={28} /> Sponsored Listings
        </h1>
        <p className="text-sm text-neutral-500 mt-1">Manage featured PGs to boost their visibility in search results.</p>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-sm text-left min-w-[600px]">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Listing</th>
                <th className="px-6 py-4 font-semibold">Owner</th>
                <th className="px-6 py-4 font-semibold">City</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data.map((l: any) => (
                <tr key={l.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-neutral-900 flex items-center gap-2">
                      <Building2 size={16} className="text-neutral-400" />
                      {l.title}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{l.owner.name}</div>
                    <div className="text-xs text-neutral-500">{l.owner.phone}</div>
                  </td>
                  <td className="px-6 py-4 capitalize">{l.city.name}</td>
                  <td className="px-6 py-4">
                    {l.isFeatured ? (
                      <div>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800">
                          Sponsored
                        </span>
                        {l.featuredUntil && (
                          <div className="text-[10px] text-neutral-500 mt-1 flex items-center gap-1">
                            <Calendar size={10} /> Ends {new Date(l.featuredUntil).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-neutral-400 text-xs">Standard</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      disabled={processing}
                      onClick={() => toggleSponsorship(l.id, l.isFeatured)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-xs transition ${
                        l.isFeatured 
                          ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                          : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                      }`}
                    >
                      {l.isFeatured ? <><ToggleRight size={16} /> Revoke</> : <><ToggleLeft size={16} /> Sponsor</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Mobile View */}
        <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
          {data.map((l: any) => (
            <div key={`mob-${l.id}`} className="bg-white border border-neutral-100 rounded-xl p-4 shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <Building2 size={16} className="text-neutral-400" />
                    {l.title}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">By {l.owner.name} ({l.owner.phone})</div>
                </div>
                <div>
                  {l.isFeatured ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                      Sponsored
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-600">
                      Standard
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm bg-neutral-50 p-3 rounded-xl border border-neutral-100 mt-2">
                <div>
                  <span className="text-xs text-neutral-400 block mb-0.5">City</span>
                  <span className="font-semibold text-neutral-700 block capitalize">{l.city.name}</span>
                </div>
                {l.isFeatured && l.featuredUntil && (
                  <div>
                    <span className="text-xs text-neutral-400 block mb-0.5">Ends On</span>
                    <span className="font-semibold text-neutral-700 block">{new Date(l.featuredUntil).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <button 
                disabled={processing}
                onClick={() => toggleSponsorship(l.id, l.isFeatured)}
                className={`w-full mt-2 inline-flex justify-center items-center gap-2 px-3 py-2.5 rounded-lg font-bold text-sm transition ${
                  l.isFeatured 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }`}
              >
                {l.isFeatured ? <><ToggleRight size={18} /> Revoke Sponsorship</> : <><ToggleLeft size={18} /> Make Sponsored</>}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
