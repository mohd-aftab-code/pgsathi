"use client";

import { useState, useEffect } from "react";
import { Settings, Bell, Clock, Shield, Wrench, Save, CheckCircle2, Loader2, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";

type SettingsData = {
  trialDays: number;
  announcementEnabled: boolean;
  announcementText: string;
  maintenanceMode: boolean;
  defaultTrialPlanSlug: string;
};

const DEFAULTS: SettingsData = {
  trialDays: 14,
  announcementEnabled: false,
  announcementText: "",
  maintenanceMode: false,
  defaultTrialPlanSlug: "starter",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const d = await res.json();
      if (d.success) setSettings(d.data);
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const d = await res.json();
      if (d.success) {
        toast.success("Settings saved!");
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(d.message || "Failed to save");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  const set = <K extends keyof SettingsData>(key: K, val: SettingsData[K]) =>
    setSettings((prev) => ({ ...prev, [key]: val }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-neutral-400">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm font-medium">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Global Settings</h1>
          <p className="text-neutral-500 text-xs font-medium mt-0.5">Platform configuration for PGSathi admin.</p>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={load}
            className="h-8 w-8 flex items-center justify-center bg-white border border-neutral-200 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 hover:border-neutral-300 transition-colors shadow-sm"
          >
            <RefreshCcw size={14} />
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="h-8 px-4 flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : saved ? <CheckCircle2 size={12} /> : <Save size={12} />}
            {saving ? "Saving..." : saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      {/* Trial Duration */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-neutral-100/60">
          <div className="p-2 bg-blue-50/80 border border-blue-100/60 rounded-lg">
            <Clock size={14} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-[12px] font-black uppercase tracking-wide text-neutral-900 leading-none">Free Trial Duration</h2>
            <p className="text-[10px] font-medium text-neutral-500 mt-0.5">Naye owners ko kitne din ka free trial milega</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-500 mb-1.5 block">Trial Days</label>
            <input
              type="number"
              min={1}
              max={90}
              value={settings.trialDays}
              onChange={(e) => set("trialDays", parseInt(e.target.value) || 14)}
              className="w-full px-3 h-8 bg-white border border-neutral-200 rounded-lg text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-violet-400 focus:border-violet-400 shadow-sm transition-all"
            />
          </div>
          <div className="flex-1">
            <label className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-500 mb-1.5 block">Default Plan Slug</label>
            <input
              type="text"
              value={settings.defaultTrialPlanSlug}
              onChange={(e) => set("defaultTrialPlanSlug", e.target.value)}
              placeholder="starter"
              className="w-full px-3 h-8 bg-white border border-neutral-200 rounded-lg text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-violet-400 focus:border-violet-400 shadow-sm transition-all"
            />
          </div>
        </div>
        <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 mt-2.5">
          Currently: <strong className="text-neutral-700">{settings.trialDays} days</strong> free trial on <strong className="text-neutral-700">{settings.defaultTrialPlanSlug}</strong> plan
        </p>
      </div>

      {/* Announcement Banner */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-neutral-100/60">
          <div className="p-2 bg-amber-50/80 border border-amber-100/60 rounded-lg">
            <Bell size={14} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-[12px] font-black uppercase tracking-wide text-neutral-900 leading-none">Platform Announcement</h2>
            <p className="text-[10px] font-medium text-neutral-500 mt-0.5">Site-wide message — sabko dikhega</p>
          </div>
          {/* Toggle */}
          <button
            onClick={() => set("announcementEnabled", !settings.announcementEnabled)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
              settings.announcementEnabled ? "bg-amber-500" : "bg-neutral-300"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
                settings.announcementEnabled ? "translate-x-4.5" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className={settings.announcementEnabled ? "" : "opacity-50 pointer-events-none"}>
          <label className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-500 mb-1.5 block">Message</label>
          <textarea
            value={settings.announcementText}
            onChange={(e) => set("announcementText", e.target.value)}
            placeholder="e.g. PGSathi 2.0 launch ho gaya!"
            rows={2}
            className="w-full px-3 py-2.5 bg-white border border-neutral-200 rounded-lg text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-violet-400 focus:border-violet-400 resize-none shadow-sm transition-all"
          />
          {settings.announcementEnabled && settings.announcementText && (
            <div className="mt-2.5 bg-amber-50 border border-amber-200/60 rounded-lg px-3 py-2 text-[10px] text-amber-800 font-bold uppercase tracking-wider">
              📢 Preview: <span className="font-medium normal-case">{settings.announcementText}</span>
            </div>
          )}
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className={`backdrop-blur-md rounded-2xl border p-4 sm:p-5 shadow-sm transition-colors ${settings.maintenanceMode ? "border-red-200/60 bg-red-50/50" : "border-neutral-200/60 bg-white/60"}`}>
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg border ${settings.maintenanceMode ? "bg-red-100/50 border-red-200/60" : "bg-neutral-50/80 border-neutral-200/60"}`}>
            <Wrench size={14} className={settings.maintenanceMode ? "text-red-600" : "text-neutral-500"} />
          </div>
          <div className="flex-1">
            <h2 className="text-[12px] font-black uppercase tracking-wide text-neutral-900 leading-none">Maintenance Mode</h2>
            <p className="text-[10px] font-medium text-neutral-500 mt-0.5">Sabhi regular users ko maintenance page dikhegi.</p>
          </div>
          <button
            onClick={() => set("maintenanceMode", !settings.maintenanceMode)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
              settings.maintenanceMode ? "bg-red-500" : "bg-neutral-300"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
                settings.maintenanceMode ? "translate-x-4.5" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        {settings.maintenanceMode && (
          <div className="mt-3 bg-red-50 border border-red-200/60 rounded-lg px-3 py-2 text-[10px] text-red-800 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Shield size={12} className="shrink-0" />
            ⚠️ Users won't be able to access the app
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 h-9 px-5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
          {saving ? "Saving..." : saved ? "Settings Saved" : "Save Settings"}
        </button>
      </div>

    </div>
  );
}
