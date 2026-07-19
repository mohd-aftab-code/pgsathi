"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, UserPlus, CalendarClock, Wallet, Wrench, Star, Sparkles, Info, Check } from "lucide-react";
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

export function NotificationBell({ viewAllHref }: { viewAllHref: string }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const res = await fetch("/api/notifications?limit=12");
      const d = await res.json();
      if (d.success) {
        setItems(d.items);
        setUnread(d.unreadCount);
      }
    } catch {
      /* silent — the bell just shows stale state */
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors"
      >
        <Bell size={20} className="text-neutral-600" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold grid place-items-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[340px] max-w-[90vw] bg-white rounded-2xl border border-neutral-200 shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
            <span className="font-bold text-neutral-900 text-sm">Notifications</span>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1">
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="py-10 text-center text-sm text-neutral-400">No notifications yet</div>
            ) : (
              items.map((n) => {
                const m = META[n.type] ?? META.SYSTEM;
                const Icon = m.icon;
                const inner = (
                  <div className={`flex gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors ${!n.isRead ? "bg-violet-50/40" : ""}`}>
                    <div className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 ${m.cls}`}>
                      <Icon size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <p className="text-sm font-semibold text-neutral-900 leading-snug">{n.title}</p>
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0 mt-1.5" />}
                      </div>
                      {n.message && <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{n.message}</p>}
                      <p className="text-[10px] text-neutral-400 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                    </div>
                  </div>
                );
                return n.link ? (
                  <Link key={n.id} href={n.link} onClick={() => { markOne(n.id); setOpen(false); }}>{inner}</Link>
                ) : (
                  <div key={n.id} onClick={() => markOne(n.id)}>{inner}</div>
                );
              })
            )}
          </div>

          <Link href={viewAllHref} onClick={() => setOpen(false)} className="block text-center py-2.5 text-xs font-bold text-violet-600 hover:bg-neutral-50 border-t border-neutral-100">
            View all
          </Link>
        </div>
      )}
    </div>
  );
}
