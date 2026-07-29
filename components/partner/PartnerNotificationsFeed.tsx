"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Building2, IndianRupee, Megaphone } from "lucide-react";

type Notif = {
  id: number;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

function icon(type: string) {
  if (type === "PARTNER_PG") return Building2;
  if (type === "PARTNER_EARNING") return IndianRupee;
  return Megaphone;
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "abhi";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function PartnerNotificationsFeed({ initial, initialUnread }: { initial: Notif[]; initialUnread: number }) {
  const [items, setItems] = useState(initial);
  const [unread, setUnread] = useState(initialUnread);

  async function markAll() {
    if (unread === 0) return;
    setItems((xs) => xs.map((x) => ({ ...x, isRead: true })));
    setUnread(0);
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) }).catch(() => {});
  }

  async function markOne(id: number) {
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, isRead: true } : x)));
    setUnread((u) => Math.max(0, u - 1));
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }).catch(() => {});
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 grid place-items-center mx-auto mb-3">
          <Bell className="text-neutral-400" size={22} />
        </div>
        <p className="font-semibold text-neutral-700 dark:text-neutral-300">No notifications</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Updates on PG approvals and earnings will appear here.</p>
      </div>
    );
  }

  return (
    <>
      {unread > 0 && (
        <div className="flex justify-end">
          <button onClick={markAll} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <CheckCheck size={15} /> Mark all as read
          </button>
        </div>
      )}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm divide-y divide-neutral-100 dark:divide-neutral-800">
        {items.map((n) => {
          const Icon = icon(n.type);
          const Row = (
            <div
              className={`flex gap-3 px-5 py-4 transition-colors ${!n.isRead ? "bg-primary-50/50 dark:bg-primary-950/20" : ""} hover:bg-neutral-50 dark:hover:bg-neutral-800/40`}
              onClick={() => !n.isRead && markOne(n.id)}
            >
              <div className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${!n.isRead ? "bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400"}`}>
                <Icon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm ${!n.isRead ? "font-bold text-neutral-900 dark:text-white" : "font-semibold text-neutral-700 dark:text-neutral-300"}`}>{n.title}</p>
                  <span className="text-[11px] text-neutral-400 shrink-0">{timeAgo(n.createdAt)}</span>
                </div>
                {n.message && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{n.message}</p>}
              </div>
              {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />}
            </div>
          );
          return n.link ? (
            <Link key={n.id} href={n.link} onClick={() => !n.isRead && markOne(n.id)} className="block">{Row}</Link>
          ) : (
            <div key={n.id} className="cursor-pointer">{Row}</div>
          );
        })}
      </div>
    </>
  );
}
