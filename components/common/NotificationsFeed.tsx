"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserPlus, CalendarClock, Wallet, Wrench, Star, Sparkles, Info, Check, BellOff, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const META: Record<string, { icon: LucideIcon; cls: string }> = {
  LEAD: { icon: UserPlus, cls: "bg-violet-50 text-violet-600" },
  VISIT: { icon: CalendarClock, cls: "bg-blue-50 text-blue-600" },
  PAYMENT: { icon: Wallet, cls: "bg-green-50 text-green-600" },
  RENT_DUE: { icon: Wallet, cls: "bg-red-50 text-red-600" },
  COMPLAINT: { icon: Wrench, cls: "bg-orange-50 text-orange-600" },
  REVIEW: { icon: Star, cls: "bg-amber-50 text-amber-600" },
  SUBSCRIPTION: { icon: Sparkles, cls: "bg-indigo-50 text-indigo-600" },
  SYSTEM: { icon: Info, cls: "bg-neutral-100 text-neutral-600" },
};

type Notif = { id: number; type: string; title: string; message: string | null; link: string | null; isRead: boolean; createdAt: string };

export function NotificationsFeed() {
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);

  async function load() {
    try {
      const res = await fetch("/api/notifications?limit=50");
      const d = await res.json();
      if (d.success) {
        setItems(d.items);
        setUnread(d.unreadCount);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markAll() {
    setUnread(0);
    setItems((p) => p.map((n) => ({ ...n, isRead: true })));
    try {
      await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: "{}" });
    } catch {}
  }

  async function markOne(id: number) {
    setItems((p) => p.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
    try {
      await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    } catch {}
  }

  if (loading) {
    return (
      <div className="py-16 text-center text-neutral-400">
        <Loader2 className="animate-spin mx-auto mb-2" size={24} />
        <p className="text-sm">Loading notifications…</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <span className="text-sm font-semibold text-neutral-600">
          {unread > 0 ? `${unread} unread` : "All caught up"}
        </span>
        {unread > 0 && (
          <button onClick={markAll} className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1.5">
            <Check size={13} /> Mark all read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-16 text-center text-neutral-400">
          <BellOff size={30} className="mx-auto mb-3 text-neutral-300" />
          <p className="text-sm font-medium">No notifications yet</p>
          <p className="text-xs mt-1">New leads, payments and complaints will show up here.</p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100">
          {items.map((n) => {
            const m = META[n.type] ?? META.SYSTEM;
            const Icon = m.icon;
            const inner = (
              <div className={`flex gap-3.5 px-5 py-4 hover:bg-neutral-50 transition-colors ${!n.isRead ? "bg-violet-50/40" : ""}`}>
                <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${m.cls}`}>
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <p className="font-semibold text-neutral-900 leading-snug">{n.title}</p>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0 mt-1.5" />}
                  </div>
                  {n.message && <p className="text-sm text-neutral-500 mt-0.5">{n.message}</p>}
                  <p className="text-xs text-neutral-400 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                </div>
              </div>
            );
            return n.link ? (
              <Link key={n.id} href={n.link} onClick={() => markOne(n.id)} className="block">{inner}</Link>
            ) : (
              <div key={n.id} onClick={() => markOne(n.id)}>{inner}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
